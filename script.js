const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const API_KEY = 'ca3c14dea06fd66918ed165533f10f6b';

// Live Clock
setInterval(() => {
  const time = new Date();
  const month = time.getMonth();
  const date = time.getDate();
  const day = time.getDay();
  const hour = time.getHours();
  const hoursIn12HrFormat = hour % 12 || 12;  // 12-hour format fix
  const minutes = time.getMinutes();
  const ampm = hour >= 12 ? 'PM' : 'AM';

  timeEl.innerHTML = `${hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat}:${
    minutes < 10 ? '0' + minutes : minutes
  } <span id="am-pm">${ampm}</span>`;
  dateEl.innerHTML = `${days[day]}, ${date} ${months[month]}`;
}, 1000);

// Get Weather using Geolocation
function getWeatherData() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (success) => {
      const { latitude, longitude } = success.coords;

      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=ca3c14dea06fd66918ed165533f10f6b`;


      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (data.list && data.list.length > 0) {
            showWeatherData(data);
          } else {
            console.error('No weather data available.');
          }
        })
        .catch((error) => {
          console.error('Error fetching weather data:', error);
        });
    },
    (error) => {
      console.error('Geolocation error:', error);
      alert('Unable to retrieve your location.');
    }
  );
}

// Render Weather Data from 5-day forecast
function showWeatherData(data) {
  // Show timezone and coordinates
  timezone.innerHTML = data.city.name + ', ' + data.city.country;
  countryEl.innerHTML = `Lat: ${data.city.coord.lat} N, Lon: ${data.city.coord.lon} E`;

  // Show current weather from the first item in the forecast list (closest 3-hour block)
  const current = data.list[0];
  const { humidity, pressure, wind } = current.main;
  const windSpeed = current.wind.speed;
  const sunrise = data.city.sunrise * 1000; // in ms
  const sunset = data.city.sunset * 1000;

  currentWeatherItemsEl.innerHTML = `
    <div class="weather-item"><div>Humidity</div><div>${humidity}%</div></div>
    <div class="weather-item"><div>Pressure</div><div>${pressure} hPa</div></div>
    <div class="weather-item"><div>Wind Speed</div><div>${windSpeed} m/s</div></div>
    <div class="weather-item"><div>Sunrise</div><div>${window.moment(sunrise).format('hh:mm A')}</div></div>
    <div class="weather-item"><div>Sunset</div><div>${window.moment(sunset).format('hh:mm A')}</div></div>
  `;

  currentTempEl.innerHTML = `
    <img src="http://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png" alt="weather icon" class="w-icon" />
    <div class="other">
      <div class="day">${window.moment(current.dt * 1000).format('dddd, MMM D')}</div>
      <div class="temp">Temp - ${current.main.temp}&#176;C</div>
      <div class="temp">Feels Like - ${current.main.feels_like}&#176;C</div>
      <div class="description">${current.weather[0].description}</div>
    </div>
  `;

  // Group forecast by day
  let forecastByDay = {};

  data.list.forEach((item) => {
    const date = window.moment(item.dt * 1000).format('YYYY-MM-DD');
    if (!forecastByDay[date]) {
      forecastByDay[date] = [];
    }
    forecastByDay[date].push(item);
  });

  // Create forecast HTML showing average day temp for each day
  let forecastHTML = '';

  Object.keys(forecastByDay).forEach((date) => {
    const dayItems = forecastByDay[date];
    const temps = dayItems.map((i) => i.main.temp);
    const tempMin = Math.min(...temps).toFixed(1);
    const tempMax = Math.max(...temps).toFixed(1);
    const dayName = window.moment(date).format('ddd');

    // Use icon from first item of the day
    const icon = dayItems[0].weather[0].icon;

    forecastHTML += `
      <div class="weather-forecast-item">
        <div class="day">${dayName}</div>
        <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon" class="w-icon" />
        <div class="temp">Min: ${tempMin}&#176;C</div>
        <div class="temp">Max: ${tempMax}&#176;C</div>
      </div>
    `;
  });

  weatherForecastEl.innerHTML = forecastHTML;
}

// Initial call
getWeatherData();
