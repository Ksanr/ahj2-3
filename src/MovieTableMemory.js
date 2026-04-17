import moviesData from './movies.json';

// Константы для настройки
const SORT_INTERVAL_MS = 2000;
const IMDB_DECIMAL_PLACES = 2;
const SORT_FIELDS = ['id', 'title', 'year', 'imdb'];
const SORT_ORDERS = ['asc', 'desc'];

export default class MovieTableMemory {
  constructor() {
    this.originalData = [...moviesData];
    this.sortedData = [...moviesData];
    this.sortOrders = SORT_ORDERS;
    this.fields = SORT_FIELDS;
    this.currentFieldIndex = 0;
    this.currentOrderIndex = 0;
    this.intervalId = null;
  }

  // Форматирование числа с указанным количеством знаков после запятой
  formatIMDB(value) {
    return value.toFixed(IMDB_DECIMAL_PLACES);
  }

  // Сортировка данных в памяти
  sortData(field, order) {
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

  // Создание строки таблицы с data-атрибутами
  createRow(movie) {
    const tr = document.createElement('tr');

    // Установка data-атрибутов
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

  // Полная перерисовка таблицы
  renderTable(container) {
    if (!container) {
      throw new Error('Контейнер для отображения таблицы не найден');
    }

    container.innerHTML = '';
    this.sortedData.forEach(movie => {
      container.appendChild(this.createRow(movie));
    });
  }

  // Обновление стрелок в заголовке
  updateArrows(field, order) {
    // Очищаем все стрелки
    const allArrows = document.querySelectorAll('.arrow');
    if (allArrows.length > 0) {
      allArrows.forEach(arrow => {
        arrow.className = 'arrow';
      });
    }

    // Находим нужный заголовок
    const th = document.querySelector(`th[data-field="${field}"]`);
    if (th) {
      const arrow = th.querySelector('.arrow');
      if (arrow) {
        arrow.classList.add(order === 'asc' ? 'asc' : 'desc');
      }
    }
  }

  // Обновление индикатора сортировки
  updateIndicator() {
    const currentField = this.fields[this.currentFieldIndex];
    const currentOrder = this.sortOrders[this.currentOrderIndex];
    const indicator = document.querySelector('.sort-indicator');

    if (!indicator) {
      return;
    }

    const orderText = currentOrder === 'asc' ? 'по возрастанию' : 'по убыванию';
    const fieldNames = {
      id: 'ID',
      title: 'названию',
      year: 'году выпуска',
      imdb: 'рейтингу IMDB'
    };

    indicator.textContent = `Сортировка по ${fieldNames[currentField]} (${orderText}) | Обновляется каждые ${SORT_INTERVAL_MS / 1000} секунды | In-Memory Storage`;
  }

  // Следующий этап сортировки
  nextSort() {
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

    this.sortData(currentField, currentOrder);

    const tbody = document.getElementById('tableBody');
    if (!tbody) {
      throw new Error('Элемент tableBody не найден в DOM');
    }

    this.renderTable(tbody);
    this.updateArrows(currentField, currentOrder);
    this.updateIndicator();
  }

  // Запуск автоматической сортировки
  startAutoSort() {
    this.updateIndicator();
    this.intervalId = setInterval(() => {
      this.nextSort();
    }, SORT_INTERVAL_MS);
  }

  // Остановка автоматической сортировки
  stopAutoSort() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Инициализация таблицы
  init() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) {
      throw new Error('Элемент tableBody не найден в DOM при инициализации');
    }
    this.renderTable(tbody);
    this.startAutoSort();
  }
}
