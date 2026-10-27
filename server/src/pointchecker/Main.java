package pointchecker;

import com.fastcgi.FCGIInterface;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

public final class Main {
    private static final int MAX_BODY_LENGTH = 1024;
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");

    // История проверок хранится в памяти сервера между запросами.
    private static final List<CheckResult> history = new ArrayList<>();


    public static void main(String[] args) {
        FCGIInterface fcgi = new FCGIInterface();
        while (fcgi.FCGIaccept() >= 0) {
            long startNanos = System.nanoTime();
            Properties params = FCGIInterface.request.params;
            try {
                // POST добавляет точку, любой другой запрос просто возвращает историю.
                if ("POST".equals(params.getProperty("REQUEST_METHOD"))) {
                    Point point = PointValidator.parse(readBody(params));
                    history.add(0, new CheckResult(point, AreaChecker.isHit(point), now(), micros(startNanos)));
                }
                send(200, "OK", "{\"currentTime\":\"" + now() + "\""
                        + ",\"execTime\":" + micros(startNanos)
                        + ",\"history\":" + history.stream().map(CheckResult::toJson)
                                .collect(Collectors.joining(",", "[", "]"))
                        + "}");
            } catch (IOException | IllegalArgumentException e) {
                send(400, "Bad Request", "{\"error\":\"" + e.getMessage().replace('"', '\'') + "\"}");
            }
        }
    }

    // Читаем тело запроса ровно на CONTENT_LENGTH байт.
    private static String readBody(Properties params) throws IOException {
        int length = Integer.parseInt(params.getProperty("CONTENT_LENGTH", "0").trim());
        if (length < 0 || length > MAX_BODY_LENGTH) {
            throw new IllegalArgumentException("Недопустимая длина тела запроса");
        }
        return new String(FCGIInterface.request.inStream.readNBytes(length), StandardCharsets.UTF_8);
    }

    // Apache подключает сервер с флагом -nph, поэтому статусную строку пишем сами.
    private static void send(int status, String reason, String json) {
        byte[] body = json.getBytes(StandardCharsets.UTF_8);
        String headers = "HTTP/1.1 " + status + " " + reason + "\r\n"
                + "Content-Type: application/json; charset=utf-8\r\n"
                + "Content-Length: " + body.length + "\r\n"
                + "\r\n";
        System.out.writeBytes(headers.getBytes(StandardCharsets.UTF_8));
        System.out.writeBytes(body);
        System.out.flush();
    }

    private static String now() {
        return LocalDateTime.now().format(TIME_FORMAT);
    }

    private static long micros(long startNanos) {
        return (System.nanoTime() - startNanos) / 1000;
    }
}
