# Локальная замена Apache: отдаёт статику и пересылает /fcgi-bin/ на FastCGI-сервер.
# Запуск: python3 dev-server.py  ->  http://localhost:8080/
import http.server
import socket
import struct

HTTP_PORT = 8080
FCGI_ADDR = ('localhost', 24001)


def record(rec_type, content):
    return struct.pack('>BBHHBx', 1, rec_type, 1, len(content), 0) + content


def name_value(key, value):
    k, v = key.encode(), value.encode()
    return bytes([len(k), len(v)]) + k + v


def fcgi_request(method, body):
    params = name_value('REQUEST_METHOD', method) + name_value('CONTENT_LENGTH', str(len(body)))
    packet = (record(1, struct.pack('>HB5x', 1, 0)) + record(4, params) + record(4, b'')
              + (record(5, body) if body else b'') + record(5, b''))
    out = b''
    with socket.create_connection(FCGI_ADDR) as s:
        s.sendall(packet)
        stream = s.makefile('rb')
        while True:
            header = stream.read(8)
            if len(header) < 8:
                break
            _, rec_type, _, length, padding = struct.unpack('>BBHHBx', header)
            data = stream.read(length + padding)[:length]
            if rec_type == 6:
                out += data
            if rec_type == 3:
                break
    return out


class Handler(http.server.SimpleHTTPRequestHandler):
    def proxy(self, method):
        length = int(self.headers.get('Content-Length') or 0)
        raw = fcgi_request(method, self.rfile.read(length))
        head, _, body = raw.partition(b'\r\n\r\n')
        lines = head.decode().split('\r\n')
        self.send_response(int(lines[0].split()[1]))
        for line in lines[1:]:
            key, _, value = line.partition(': ')
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.startswith('/fcgi-bin/'):
            self.proxy('GET')
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith('/fcgi-bin/'):
            self.proxy('POST')
        else:
            self.send_error(405)


http.server.ThreadingHTTPServer(('localhost', HTTP_PORT), Handler).serve_forever()
