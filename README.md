# Домашнее задание к занятию "2. DOM"
# Movie Table with In-Memory Sorting 🎬

[![Build and Deploy](https://github.com/ksanr/ahj2-3/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/movie-table-memory/actions/workflows/deploy.yml)

Таблица фильмов с автоматической сортировкой с использованием **In-Memory Storage**.

## Отличия от data-attributes подхода

| Аспект | Data-Attributes | In-Memory |
|--------|----------------|-----------|
| Хранение данных | В DOM-атрибутах | В JavaScript массиве |
| Сортировка | Перемещение DOM-элементов | Сортировка массива + перерисовка |
| Производительность | Быстрее при малых данных | Лучше при больших данных |
| Сложность кода | Выше | Ниже |
| Поддерживаемость | Сложнее | Легче |

## Особенности

- 📊 Сортировка по 4 полям (ID, Title, Year, IMDB)
- 🔄 Автоматическая смена сортировки каждые 2 секунды
- ⬆️⬇️ Визуальные индикаторы направления сортировки
- 💾 Хранение данных в памяти JavaScript
- 🔄 Полная перерисовка DOM при каждой сортировке

## Демо

[GitHub Pages](https://ksanr.github.io/ahj2-3/)

## Локальный запуск

```bash
yarn install
yarn start
