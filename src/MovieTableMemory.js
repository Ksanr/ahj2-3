import moviesData from './movies.json';

export default class MovieTableMemory {
  constructor() {
    // Хранение исходных данных в памяти
    this.originalData = [...moviesData];
    this.sortedData = [...moviesData];

    // Настройки сортировки
    this.sortOrders = ['asc', 'desc'];
    this.fields = ['id', 'title', 'year', 'imdb'];
    this.currentFieldIndex = 0;
    this.currentOrderIndex = 0;
    this.intervalId = null;
  }

  // Форматирование числа с двумя знаками после запятой
  formatIMDB(value) {
    return value.toFixed(2);
  }

  // Сортировка массива в памяти
  sortData(field, order) {
    // Создаем копию массива для сортировки (не мутируем оригинал)
    const sorted = [...this.originalData];

    sorted.sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // Специальная обработка для строк (title)
      if (field === 'title') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;

      return order === 'asc' ? comparison : -comparison;
    });

    this.sortedData = sorted;
    return this.sortedData;
  }

  // Создание строки таблицы из объекта данных
  createRow(movie) {
    const tr = document.createElement('tr');

    // Добавляем data-атрибуты для обратной совместимости
    tr.setAttribute('data-id', movie.id);
    tr.setAttribute('data-title', movie.title);
    tr.setAttribute('data-year', movie.year);
    tr.setAttribute('data-imdb', movie.imdb);

    // Создание ячеек
    const tdId = document.createElement('td');
    tdId.textContent = `#${movie.id}`;

    const tdTitle = document.createElement('td');
    tdTitle.textContent = movie.title;

    const tdYear = document.createElement('td');
    tdYear.textContent = `(${movie.year})`;

    const tdImdb = document.createElement('td');
    tdImdb.textContent = `imdb: ${this.formatIMDB(movie.imdb)}`;

    tr.appendChild(tdId);
    tr.appendChild(tdTitle);
    tr.appendChild(tdYear);
    tr.appendChild(tdImdb);

    return tr;
  }

  // Полная перерисовка таблицы (пересборка DOM)
  renderTable(container) {
    // Очищаем контейнер
    container.innerHTML = '';

    // Перебираем отсортированные данные и создаем строки
    this.sortedData.forEach(movie => {
      container.appendChild(this.createRow(movie));
    });
  }

  // Обновление стрелок в заголовке
  updateArrows(field, order) {
    // Очищаем все стрелки
    document.querySelectorAll('.arrow').forEach(arrow => {
      arrow.className = 'arrow';
    });

    // Находим нужный заголовок
    const th = document.querySelector(`th[data-field="${field}"]`);
    if (th) {
      const arrow = th.querySelector('.arrow');
      arrow.classList.add(order === 'asc' ? 'asc' : 'desc');
    }
  }

  // Обновление индикатора сортировки
  updateIndicator() {
    const currentField = this.fields[this.currentFieldIndex];
    const currentOrder = this.sortOrders[this.currentOrderIndex];
    const indicator = document.querySelector('.sort-indicator');
    const orderText = currentOrder === 'asc' ? 'по возрастанию' : 'по убыванию';
    const fieldNames = {
      id: 'ID',
      title: 'названию',
      year: 'году выпуска',
      imdb: 'рейтингу IMDB'
    };
    indicator.innerHTML = `🔄 Сортировка по ${fieldNames[currentField]} (${orderText}) | Обновляется каждые 2 секунды | In-Memory Storage`;
  }

  // Следующий этап сортировки
  nextSort() {
    // Обновляем индексы
    this.currentOrderIndex++;
    if (this.currentOrderIndex >= this.sortOrders.length) {
      this.currentOrderIndex = 0;
      this.currentFieldIndex++;
      if (this.currentFieldIndex >= this.fields.length) {
        this.currentFieldIndex = 0;
      }
    }

    const currentField = this.fields[this.currentFieldIndex];
    const currentOrder = this.sortOrders[this.currentOrderIndex];

    // Сортируем данные в памяти
    this.sortData(currentField, currentOrder);

    // Полностью перерисовываем таблицу
    const tbody = document.getElementById('tableBody');
    this.renderTable(tbody);

    // Обновляем визуальные индикаторы
    this.updateArrows(currentField, currentOrder);
    this.updateIndicator();
  }

  // Запуск автоматической сортировки
  startAutoSort() {
    this.updateIndicator();
    this.intervalId = setInterval(() => {
      this.nextSort();
    }, 2000);
  }

  // Остановка автоматической сортировки
  stopAutoSort() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Инициализация таблицы
  init() {
    const tbody = document.getElementById('tableBody');
    this.renderTable(tbody);
    this.startAutoSort();
  }
}
