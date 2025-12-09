import "./style.css";
import { fetchWeatherApi } from "openmeteo";

type DailyWeather = {
  date: Date;
  sunrise: Date;
  sunset: Date;
  tempMax?: number;
  tempMin?: number;
};

type SimpleWeather = {
  currentTemp: number;
  sunriseToday: Date;
  sunsetToday: Date;
  daily: DailyWeather[];
};

// Форматирование времени
function formatTime(date: Date): string {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Форматирование даты
function formatDay(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

async function loadWeather(): Promise<SimpleWeather> {
  const params = {
    latitude: 58.0105,
    longitude: 56.2502,
    daily: ["sunrise", "sunset", "temperature_2m_max", "temperature_2m_min"],
    hourly: "temperature_2m",
    timezone: "Europe/Moscow",
  } as const;

  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);
  const response = responses[0];

  const utcOffsetSeconds = response.utcOffsetSeconds();
  const hourly = response.hourly()!;
  const daily = response.daily()!;

  const sunriseVar = daily.variables(0)!;
  const sunsetVar = daily.variables(1)!;
  const dailyTempMax = daily.variables(2)!.valuesArray()!;
  const dailyTempMin = daily.variables(3)!.valuesArray()!;

  const hourlyTemperatures = hourly.variables(0)!.valuesArray()!;

  const dailyTimes = Array.from(
    {
      length:
        (Number(daily.timeEnd()) - Number(daily.time())) / daily.interval(),
    },
    (_, i) =>
      new Date(
        (Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000
      )
  );

  // sunrise/sunset как Date[]
  const sunriseDates = [...Array(sunriseVar.valuesInt64Length())].map(
    (_, i) =>
      new Date((Number(sunriseVar.valuesInt64(i)) + utcOffsetSeconds) * 1000)
  );
  const sunsetDates = [...Array(sunsetVar.valuesInt64Length())].map(
    (_, i) =>
      new Date((Number(sunsetVar.valuesInt64(i)) + utcOffsetSeconds) * 1000)
  );

  // Собираем массив по дням
  const dailyWeather: DailyWeather[] = dailyTimes.map((date, index) => ({
    date,
    sunrise: sunriseDates[index],
    sunset: sunsetDates[index],
    tempMax: dailyTempMax[index],
    tempMin: dailyTempMin[index],
  }));

  // Текущая температура
  const currentTemp = hourlyTemperatures[0];
  const sunriseToday = dailyWeather[0].sunrise;
  const sunsetToday = dailyWeather[0].sunset;

  // Возвращаем упрощённую структуру для UI
  return {
    currentTemp,
    sunriseToday,
    sunsetToday,
    daily: dailyWeather,
  };
}

// Обновляем основную карточку
function updateCurrentWeather(weather: SimpleWeather): void {
  const tempEl = document.getElementById("weather-temp");
  const sunriseEl = document.getElementById("weather-sunrise");
  const sunsetEl = document.getElementById("weather-sunset");
  const updatedEl = document.getElementById("weather-updated");

  if (!tempEl || !sunriseEl || !sunsetEl || !updatedEl) return;

  tempEl.textContent = `${Math.round(weather.currentTemp)}°C`;
  sunriseEl.textContent = formatTime(weather.sunriseToday);
  sunsetEl.textContent = formatTime(weather.sunsetToday);
  updatedEl.textContent = formatTime(new Date());
}

// Отрисовываем погоду на неделю
function updateWeekWeather(weather: SimpleWeather): void {
  const weekEl = document.getElementById("weather-week");
  if (!weekEl) return;

  // чистим старое содержимое
  weekEl.innerHTML = "";

  weather.daily.forEach((day, index) => {
    const div = document.createElement("div");
    div.className = "weather-week__item";

    const dayLabel =
      index === 0 ? `Сегодня, ${formatDay(day.date)}` : formatDay(day.date);

    const left = document.createElement("div");
    left.className = "weather-week__day";
    left.textContent = dayLabel;

    const right = document.createElement("div");
    right.className = "weather-week__sun";

    const tempPart =
      day.tempMax !== undefined && day.tempMin !== undefined
        ? `<span class="weather-week__temp">${Math.round(
            day.tempMin
          )}…${Math.round(day.tempMax)}°C</span>`
        : "";

    right.innerHTML = `
      <div>${formatTime(day.sunrise)}</div>
      <div>${formatTime(day.sunset)} ${tempPart}</div>
    `;

    div.appendChild(left);
    div.appendChild(right);
    weekEl.appendChild(div);
  });
}

// Старт + автообновление
async function init() {
  try {
    const weather = await loadWeather();
    updateCurrentWeather(weather);
    updateWeekWeather(weather);
  } catch (e) {
    console.error("Ошибка при загрузке погоды", e);
  }

  setInterval(async () => {
    try {
      const weather = await loadWeather();
      updateCurrentWeather(weather);
    } catch (e) {
      console.error("Ошибка автообновления погоды", e);
    }
  }, 60_000);
}

init();
