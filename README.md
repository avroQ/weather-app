# Weather App + Monitoring Stack (Prometheus + Grafana)

Прим.: _Nginx не поднимал, просто упаковал в превью движка Vite, поэтому в ямал файле промитей обращается к localhost, а не к выделенному серверу_

Этот проект состоит из двух частей:

1. **Weather App** — простое веб-приложение, показывающее текущую температуру.  
   Написано на Vite + TypeScript, упаковано в Docker.
   API взято с сайта https://open-meteo.com

3. **Monitoring Stack** — система мониторинга доступности веб-приложения, включающая:
   - **Prometheus** — сборщик метрик  
   - **Blackbox Exporter** — HTTP-проверка доступности  
   - **Grafana** — визуализация метрик

Цель тестового задания:  
**упаковать приложение в Docker и настроить мониторинг доступности через HTTP-check.**

---

# Как запустить Weather App

Перейдите в директорию с приложением:

~~~bash 
cd weather-app
docker build -t weather-app .
docker run -d -p 8080:4173 --name weather-app weather-app
~~~

Приложение откроется по адресу: http://localhost:8080

# Как запустить мониторинг

~~~bash
cd monitoring-weather
docker compose up -d
~~~
| Сервис            | Порт | Описание                  |
| ----------------- | ---- | ------------------------- |
| Weather App       | 8080 | Само приложение           |
| Prometheus        | 9090 | Метрики + targets         |
| Blackbox Exporter | 9115 | Проверка HTTP доступности |
| Grafana           | 3000 | Дашборды                  |

# Настройка Grafana

Grafana доступна по адресу: http://localhost:3000


Логин/пароль: admin / admin

## Добавление Prometheus как Data Source

1. Grafana -> Configuration -> Data Sources
2. Add data source
3. Выбрать Prometheus
4. Указать URL: http://prometheus:9090
5. Save & Test

## Панель доступности

Рекомендуемый запрос: _probe_success_ 
<img width="1554" height="724" alt="изображение" src="https://github.com/user-attachments/assets/1ecf5255-5b18-433b-a474-671174f43406" />

# Настройка Prometheus

Prometheus доступен по адресу: http://localhost:9090

## Где вводить запросы

Работа с метриками выполняется во вкладке **Graph**:

1. Добавьте новый запрос "Add query"
2. Введите запрос в поле **Expression**  
3. Нажмите **Execute**  
4. Переключайтесь между вкладками **Table** и **Graph** для просмотра результата

## Основные запросы для мониторинга приложения

Проверка доступности: **probe_success**
Получение HTTP-кода ответа: **probe_http_status_code**
Время выполнения проверки: **probe_duration_seconds**


Эти метрики позволяют увидеть текущее состояние сервиса, успешность проверки и задержку ответа.

<img width="603" height="209" alt="изображение" src="https://github.com/user-attachments/assets/619ecfbe-28de-47dd-95f1-47216ccb4bab" />


## Status → Targets

Во вкладке **Status → Targets** отображаются все endpoints, которые опрашивает Prometheus.  
<img width="1852" height="426" alt="изображение" src="https://github.com/user-attachments/assets/269d2a6a-e40d-43f1-9311-c4f7783c77ab" />


Здесь можно увидеть:
- состояние проверок (UP/DOWN)  
- время последней проверки  
- ошибки, если они возникли  
- полный список job’ов и их endpoints  

При корректной работе мониторинга для `weather-http` будет отображаться статус **UP**.


