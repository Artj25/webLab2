const canvas = document.getElementById('graph');
const ctx = canvas.getContext('2d');

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Одна единица координат равна 40 пикселям.
const scale = 40;

// Переводим математическую координату X в координату Canvas.
function toCanvasX(x) {
    return centerX + x * scale;
}

// Переводим математическую координату Y в координату Canvas(она растет вниз).
function toCanvasY(y) {
    return centerY - y * scale;
}

// Рисуем область и оси для указанного радиуса.
function drawGraph(r) {
    // Удаляем предыдущий рисунок.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Устанавливаем цвет заливки области.
    ctx.fillStyle = '#3399ff';

    // Прямоугольник во второй четверти: -R <= x <= 0, 0 <= y <= R/2.
    ctx.fillRect(toCanvasX(-r), toCanvasY(r / 2), r * scale, (r / 2) * scale);

    // Четверть круга в первой четверти.
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, r * scale, -Math.PI / 2, 0);
    ctx.closePath();
    ctx.fill();

    // Треугольник в третьей четверти: (-R/2; 0), (0; 0), (0; -R).
    ctx.beginPath();
    ctx.moveTo(toCanvasX(-r / 2), toCanvasY(0));
    ctx.lineTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(0), toCanvasY(-r));
    ctx.closePath();
    ctx.fill();

    // Рисуем оси поверх заливки.
    ctx.strokeStyle = '#243047';
    ctx.lineWidth = 1;
    ctx.beginPath();

    ctx.moveTo(20, centerY);
    ctx.lineTo(canvas.width - 20, centerY);

    ctx.moveTo(centerX, canvas.height - 20);
    ctx.lineTo(centerX, 20);

    ctx.stroke();

    drawMarks(r);

    // Подписи осей и текущего радиуса.
    ctx.font = '16px Arial';
    ctx.fillStyle = '#243047';

    ctx.fillText('X', canvas.width - 18, centerY - 10);
    ctx.fillText('Y', centerX + 10, 20);
    ctx.fillText('0', centerX - 15, centerY - 8);
    ctx.fillText('R = ' + r, 20, 25);
}
// Рисуем точку по её координатам.
// hit — результат проверки: true или false.
function drawPoint(x, y, hit) {
    ctx.beginPath();

    // Рисуем круг радиусом 5 пикселей в нужной позиции.
    ctx.arc(
        toCanvasX(x),
        toCanvasY(y),
        5,
        0,
        2 * Math.PI
    );

    // Выбираем цвет точки.
    if (hit) {
        ctx.fillStyle = '#16803c'; // Зелёный: попадание.
    } else {
        ctx.fillStyle = '#dc2626'; // Красный: промах.
    }

    // Закрашиваем точку.
    ctx.fill();

    // Добавляем белую обводку, чтобы точка была заметна.
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
}
// Рисуем деления и подписи на обеих осях.
function drawMarks(r) {
    // Сохраняем текущие настройки рисования.
    ctx.save();

    ctx.strokeStyle = '#243047';
    ctx.fillStyle = '#243047';
    ctx.lineWidth = 1;
    ctx.font = '11px Arial';
    ctx.textBaseline = 'top';

    // Координаты делений и подписи к ним.
    const marks = [
        { value: -r, text: '−R' },
        { value: -r / 2, text: '−R/2' },
        { value: r / 2, text: 'R/2' },
        { value: r, text: 'R' }
    ];

    for (const mark of marks) {
        // Деление на горизонтальной оси.
        const pixelX = toCanvasX(mark.value);

        ctx.beginPath();
        ctx.moveTo(pixelX, centerY - 4);
        ctx.lineTo(pixelX, centerY + 4);
        ctx.stroke();

        // Подпись под горизонтальной осью.
        ctx.textAlign = 'center';
        ctx.fillText(mark.text, pixelX, centerY + 7);

        // Деление на вертикальной оси.
        const pixelY = toCanvasY(mark.value);

        ctx.beginPath();
        ctx.moveTo(centerX - 4, pixelY);
        ctx.lineTo(centerX + 4, pixelY);
        ctx.stroke();

        // Подпись справа от вертикальной оси.
        ctx.textAlign = 'left';
        ctx.fillText(mark.text, centerX + 7, pixelY + 2);
    }

    // Возвращаем настройки, которые были до вызова функции.
    ctx.restore();
}
// При открытии страницы показываем область для выбранного радиуса.
const initialRadio = document.querySelector('input[name="r"]:checked');
drawGraph(initialRadio ? Number(initialRadio.value) : 2);