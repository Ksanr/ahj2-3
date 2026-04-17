import MovieTableMemory from '../src/MovieTableMemory';
import moviesData from '../src/movies.json';

describe('MovieTableMemory', () => {
  let movieTable;
  let mockTbody;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="container">
        <div class="sort-indicator"></div>
        <div class="table-wrapper">
          <table id="movieTable" class="movie-table">
            <thead>
              <tr>
                <th data-field="id">ID <span class="arrow"></span></th>
                <th data-field="title">Title <span class="arrow"></span></th>
                <th data-field="year">Year <span class="arrow"></span></th>
                <th data-field="imdb">IMDB <span class="arrow"></span></th>
              </tr>
            </thead>
            <tbody id="tableBody"></tbody>
          </table>
        </div>
      </div>
    `;

    mockTbody = document.getElementById('tableBody');
    movieTable = new MovieTableMemory();
  });

  afterEach(() => {
    if (movieTable.intervalId) {
      movieTable.stopAutoSort();
    }
  });

  describe('formatIMDB', () => {
    test('должен форматировать число с двумя знаками после запятой', () => {
      expect(movieTable.formatIMDB(9.3)).toBe('9.30');
      expect(movieTable.formatIMDB(9.0)).toBe('9.00');
      expect(movieTable.formatIMDB(8.9)).toBe('8.90');
    });
  });

  describe('sortData', () => {
    test('должен сортировать по id по возрастанию', () => {
      const sorted = movieTable.sortData('id', 'asc');
      const ids = sorted.map(m => m.id);
      expect(ids).toEqual([25, 26, 27, 223, 1047]);
    });

    test('должен сортировать по id по убыванию', () => {
      const sorted = movieTable.sortData('id', 'desc');
      const ids = sorted.map(m => m.id);
      expect(ids).toEqual([1047, 223, 27, 26, 25]);
    });

    test('должен сортировать по title по возрастанию', () => {
      const sorted = movieTable.sortData('title', 'asc');
      const titles = sorted.map(m => m.title);
      expect(titles[0]).toBe('Криминальное чтиво');
      expect(titles[1]).toBe('Крёстный отец');
    });

    test('должен сортировать по year по возрастанию', () => {
      const sorted = movieTable.sortData('year', 'asc');
      const years = sorted.map(m => m.year);
      expect(years).toEqual([1972, 1974, 1994, 1994, 2008]);
    });

    test('должен сортировать по imdb по возрастанию', () => {
      const sorted = movieTable.sortData('imdb', 'asc');
      const imdb = sorted.map(m => m.imdb);
      expect(imdb).toEqual([8.90, 9.00, 9.00, 9.20, 9.30]);
    });
  });

  describe('createRow', () => {
    test('должен создавать строку с правильными data-атрибутами', () => {
      const movie = moviesData[0];
      const row = movieTable.createRow(movie);

      expect(row.getAttribute('data-id')).toBe(String(movie.id));
      expect(row.getAttribute('data-title')).toBe(movie.title);
      expect(row.getAttribute('data-year')).toBe(String(movie.year));
      expect(row.getAttribute('data-imdb')).toBe(String(movie.imdb));
    });

    test('должен создавать строку с правильным содержимым ячеек', () => {
      const movie = moviesData[0];
      const row = movieTable.createRow(movie);
      const cells = row.querySelectorAll('td');

      expect(cells[0].textContent).toBe(`#${movie.id}`);
      expect(cells[1].textContent).toBe(movie.title);
      expect(cells[2].textContent).toBe(`(${movie.year})`);
      expect(cells[3].textContent).toBe(`imdb: ${movie.imdb.toFixed(2)}`);
    });
  });

  describe('renderTable', () => {
    test('должен отображать все фильмы в таблице', () => {
      movieTable.renderTable(mockTbody);
      const rows = mockTbody.querySelectorAll('tr');
      expect(rows.length).toBe(moviesData.length);
    });

    test('должен выбрасывать ошибку если контейнер не найден', () => {
      expect(() => movieTable.renderTable(null)).toThrow('Контейнер для отображения таблицы не найден');
    });
  });

  describe('updateArrows', () => {
    test('должен добавлять класс asc для сортировки по возрастанию', () => {
      const th = document.querySelector('th[data-field="id"]');
      const arrow = th.querySelector('.arrow');

      movieTable.updateArrows('id', 'asc');
      expect(arrow.classList.contains('asc')).toBe(true);
    });

    test('должен добавлять класс desc для сортировки по убыванию', () => {
      const th = document.querySelector('th[data-field="id"]');
      const arrow = th.querySelector('.arrow');

      movieTable.updateArrows('id', 'desc');
      expect(arrow.classList.contains('desc')).toBe(true);
    });

    test('должен корректно обрабатывать отсутствие стрелок', () => {
      const arrows = document.querySelectorAll('.arrow');
      arrows.forEach(arrow => arrow.remove());

      expect(() => {
        movieTable.updateArrows('id', 'asc');
      }).not.toThrow();
    });

    test('должен корректно обрабатывать ситуацию когда заголовок существует но стрелка отсутствует', () => {
      // Находим заголовок id и удаляем из него стрелку
      const th = document.querySelector('th[data-field="id"]');
      const arrow = th.querySelector('.arrow');
      if (arrow) {
        arrow.remove();
      }

      // Проверяем, что стрелки больше нет
      expect(th.querySelector('.arrow')).toBeNull();

      // Метод не должен выбрасывать ошибку
      expect(() => {
        movieTable.updateArrows('id', 'asc');
      }).not.toThrow();

      // Стрелка не должна появиться (метод не создаёт её заново)
      expect(th.querySelector('.arrow')).toBeNull();
    });
  });

  describe('updateIndicator', () => {
    test('должен обновлять текст индикатора', () => {
      movieTable.updateIndicator();
      const indicator = document.querySelector('.sort-indicator');
      expect(indicator.textContent).toContain('Сортировка по');
    });

    test('должен корректно обрабатывать отсутствие индикатора', () => {
      const indicator = document.querySelector('.sort-indicator');
      indicator.remove();

      expect(() => {
        movieTable.updateIndicator();
      }).not.toThrow();
    });
  });

  describe('nextSort', () => {
    test('должен последовательно менять поля и порядок сортировки', () => {
      movieTable.renderTable(mockTbody);

      const sortSequence = [];
      for (let i = 0; i < 10; i++) {
        const field = movieTable.fields[movieTable.currentFieldIndex];
        const order = movieTable.sortOrders[movieTable.currentOrderIndex];
        sortSequence.push(`${field}-${order}`);
        movieTable.nextSort();
      }

      const uniqueSequences = new Set(sortSequence);
      expect(uniqueSequences.size).toBeGreaterThan(1);
    });

    test('должен выбрасывать ошибку если tableBody не найден', () => {
      mockTbody.remove();

      expect(() => {
        movieTable.nextSort();
      }).toThrow('Элемент tableBody не найден в DOM');
    });
  });

  describe('startAutoSort и stopAutoSort', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('startAutoSort должен запускать интервал', () => {
      movieTable.startAutoSort();
      expect(movieTable.intervalId).not.toBeNull();
    });

    test('stopAutoSort должен очищать интервал', () => {
      movieTable.startAutoSort();
      movieTable.stopAutoSort();
      expect(movieTable.intervalId).toBeNull();
    });

    test('stopAutoSort должен корректно обрабатывать вызов когда интервал не запущен', () => {
      expect(movieTable.intervalId).toBeNull();

      expect(() => {
        movieTable.stopAutoSort();
      }).not.toThrow();

      expect(movieTable.intervalId).toBeNull();
    });

    test('nextSort должен вызываться через заданный интервал', () => {
      const nextSortSpy = jest.spyOn(movieTable, 'nextSort');
      movieTable.startAutoSort();

      expect(nextSortSpy).not.toHaveBeenCalled();
      jest.advanceTimersByTime(2000);
      expect(nextSortSpy).toHaveBeenCalledTimes(1);

      movieTable.stopAutoSort();
      nextSortSpy.mockRestore();
    });
  });

  describe('init', () => {
    test('должен инициализировать таблицу и запустить сортировку', () => {
      const renderTableSpy = jest.spyOn(movieTable, 'renderTable');
      const startAutoSortSpy = jest.spyOn(movieTable, 'startAutoSort');

      movieTable.init();

      expect(renderTableSpy).toHaveBeenCalledWith(mockTbody);
      expect(startAutoSortSpy).toHaveBeenCalled();

      renderTableSpy.mockRestore();
      startAutoSortSpy.mockRestore();
    });

    test('должен выбрасывать ошибку если tableBody не найден', () => {
      mockTbody.remove();

      expect(() => movieTable.init()).toThrow('Элемент tableBody не найден в DOM при инициализации');
    });
  });
});
