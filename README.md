# Weather App + Monitoring Stack (Prometheus + Grafana)

Этот проект состоит из двух частей:

1. **Weather App** — простое веб-приложение, показывающее текущую температуру.  
   Написано на Vite + TypeScript, упаковано в Docker.
   API взято с сайта https://open-meteo.com

3. **Monitoring Stack** — система мониторинга доступности веб-приложения, включающая:
   - **Prometheus** — сборщик метрик  
   - **Blackbox Exporter** — HTTP-проверка доступности  
   - **Grafana** — визуализация метрик

Цель тестового задания / лабораторной работы:  
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

