// Находим часть таблицы для результатов.
const resultsBody = document.getElementById('results-body');

// История проверок хранится на сервере, здесь только её копия.
let results = [];

// Строим таблицу из массива результатов.
function renderResults() {
    // Очищаем старые строки.
    resultsBody.textContent = '';

    for (const record of results) {
        // Создаём строку таблицы.
        const row = document.createElement('tr');

        // Данные для шести ячеек.
        const values = [
            record.x,
            record.y,
            record.r,
            record.hit ? 'Попадание' : 'Промах',
            record.time,
            record.execTime
        ];

        // Создаём ячейки строки.
        for (const value of values) {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.append(cell);
        }

        // Добавляем строку в таблицу.
        resultsBody.append(row);
    }
}
