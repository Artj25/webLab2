const form = document.getElementById('point-form');
// форма с id="point-form"
const xInput = document.getElementById('x');
// текстовое поле для координаты X
const result = document.getElementById('result');
// абзац, куда выводятся сообщения о результате
const serverInfo = document.getElementById('server-info');
// абзац с текущим временем и временем работы сервера

// Адрес FastCGI-сервера (Apache перенаправляет запрос на него).
const SERVER_URL = '/fcgi-bin/server.jar';

const X_MIN = -5;
const X_MAX = 3;

const NUMBER_PATTERN = /^-?\d{1,2}([.,]\d{1,10})?$/;

// Выбранное значение Y (null, пока кнопка не нажата).
let selectedY = null;

function showScreamer() {
    const screamer = document.getElementById('screamer');

    screamer.hidden = false;

    setTimeout(function () {
        screamer.hidden = true;
    }, 1500);
}

function currentR() {
    const rInput = form.querySelector('input[name="r"]:checked');
    return rInput ? Number(rInput.value) : null;
}

// Перерисовываем область и точки истории для текущего R.
function redraw() {
    const r = currentR() || 2;
    drawGraph(r);
    for (const record of results) {
        if (record.r === r) {
            drawPoint(record.x, record.y, record.hit);
        }
    }
}

// Применяем ответ сервера: история, время, график.
function applyServerData(data) {
    results = data.history;
    renderResults();
    redraw();
}

// Отправляем запрос серверу и разбираем JSON-ответ.
async function request(options) {
    const response = await fetch(SERVER_URL, options);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Ошибка сервера: ' + response.status);
    }
    return data;
}

// Проверка введённых данных, возвращает текст ошибки или null.
function validate(xText, r) {
    if (xText === '') {
        return 'Введите координату X.';
    }
    if (!NUMBER_PATTERN.test(xText)) {
        return 'Ошибка: X должен быть числом. Дробную часть отделяйте ' +
            'точкой или запятой, не более 10 знаков после разделителя.';
    }
    const x = Number(xText.replace(',', '.'));
    if (x < X_MIN || x > X_MAX) {
        return 'Ошибка: X должен быть от -5 до 3.';
    }
    if (selectedY === null) {
        return 'Выберите значение Y.';
    }
    if (r === null) {
        return 'Выберите радиус R.';
    }
    return null;
}

// функция обработки отправки формы
async function handleSubmit(event) {
    // отменяем стандартную отправку, страница не перезагружается
    event.preventDefault();

    const xText = xInput.value.trim();
    const r = currentR();

    const error = validate(xText, r);
    if (error) {
        result.textContent = error;
        return;
    }

    const body = new URLSearchParams({ x: xText, y: String(selectedY), r: String(r) });

    try {
        const data = await request({ method: 'POST', body: body });
        applyServerData(data);
        const last = data.history[0];
        result.textContent = last.hit ? 'Точка попала в область.' : 'Точка не попала в область.';
        showScreamer();
    } catch (err) {
        result.textContent = 'Ошибка: ' + err.message;
    }
}

form.addEventListener('submit', handleSubmit);

// Кнопки Y: выбранной может быть только одна.
document.querySelectorAll('.y-btn').forEach(function (button) {
    button.addEventListener('click', function () {
        document.querySelectorAll('.y-btn').forEach(function (b) {
            b.classList.remove('selected');
        });
        button.classList.add('selected');
        selectedY = Number(button.dataset.y);
    });
});

// Перерисовываем график при смене R.
form.querySelectorAll('input[name="r"]').forEach(function (radio) {
    radio.addEventListener('change', redraw);
});

// При открытии страницы загружаем историю с сервера.
request({ method: 'GET' })
    .then(applyServerData)
    .catch(function (err) {
        result.textContent = 'Не удалось загрузить историю: ' + err.message;
    });
