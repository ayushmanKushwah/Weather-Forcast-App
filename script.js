async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const apiKey = "d0b8a23579884528b9372724251205";
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=4&aqi=yes`;

  if (!city) {
    document.getElementById(
      "result"
    ).innerHTML = `<p style="color:red;">Please enter a city.</p>`;
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found or API error");

    const data = await response.json();
    const { name, country } = data.location;
    const { temp_c, humidity, wind_kph, condition, air_quality } = data.current;

    const conditionText = condition.text.toLowerCase();
    const badWeatherKeywords = [
      "rain",
      "thunder",
      "storm",
      "snow",
      "fog",
      "mist",
    ];
    const isBadWeather = badWeatherKeywords.some((keyword) =>
      conditionText.includes(keyword)
    );

    if (isBadWeather) {
      document.getElementById("toastConditionText").textContent =
        condition.text;
      const toastEl = new bootstrap.Toast(
        document.getElementById("weatherToast")
      );
      toastEl.show();
    }

    updateBackground(conditionText);

    // AQI logic
    const pm25 = air_quality.pm2_5;
    let category = "";
    let aqiClass = "";

    if (pm25 <= 50) {
      category = "Good";
      aqiClass = "aqi-good";
    } else if (pm25 <= 100) {
      category = "Moderate";
      aqiClass = "aqi-moderate";
    } else if (pm25 <= 150) {
      category = "Unhealthy for Sensitive Groups";
      aqiClass = "aqi-unhealthy";
    } else if (pm25 <= 200) {
      category = "Unhealthy";
      aqiClass = "aqi-bad";
    } else {
      category = "Hazardous";
      aqiClass = "aqi-hazardous";
    }

    // Compose the HTML for main weather + AQI + forecast horizontally
    document.getElementById("result").innerHTML = `
        <div class="weather-result animate__animated animate__fadeIn">
          <img src="https:${condition.icon}" alt="${condition.text}" />
          <h2>${temp_c}°C</h2>
          <p><strong>${condition.text}</strong></p>
          <p>${name}, ${country}</p>
          <p>Humidity: ${humidity}%</p>
          <p>Wind: ${wind_kph} km/h</p>
        </div>
  
        <div class="horizontal-container">
          <div id="aqiCard" class="aqi-card mt-4 ${aqiClass}">
            <h5>Air Quality Index (AQI)</h5>
            <p id="aqiValue">PM2.5: ${pm25.toFixed(1)}</p>
            <p id="aqiCategory">Category: ${category}</p>
          </div>
  
          <div class="forecast">
            <h5>3-Day Forecast</h5>
            <div class="forecast-row">
              ${[1, 2, 3]
                .map((i) => {
                  const forecast = data.forecast.forecastday[i];
                  return forecast
                    ? `
                <div class="forecast-day">
                  <p><strong>${forecast.date}</strong></p>
                  <img src="https:${forecast.day.condition.icon}" alt="${forecast.day.condition.text}" />
                  <p>${forecast.day.condition.text}</p>
                  <p>Max: ${forecast.day.maxtemp_c}°C</p>
                  <p>Min: ${forecast.day.mintemp_c}°C</p>
                </div>
                `
                    : "";
                })
                .join("")}
            </div>
          </div>
        </div>
      `;
  } catch (error) {
    document.getElementById(
      "result"
    ).innerHTML = `<p style="color:red;">${error.message}</p>`;
    document.getElementById("aqiCard").classList.add("d-none");
  }
}

function updateBackground(condition) {
  const background = document.getElementById("backgroundIllustration");
  let imageUrl = "";

  if (condition.includes("sun") || condition.includes("clear")) {
    imageUrl = "https://i.imgur.com/9QyEVpN.jpg";
  } else if (condition.includes("cloud")) {
    imageUrl = "https://i.imgur.com/RUUDZ7u.jpg";
  } else if (condition.includes("rain")) {
    imageUrl = "https://i.imgur.com/xW7w9Zy.jpg";
  } else if (condition.includes("snow")) {
    imageUrl = "https://i.imgur.com/f4c0sAh.jpg";
  } else if (condition.includes("storm") || condition.includes("thunder")) {
    imageUrl = "https://i.imgur.com/lhxTz2A.jpg";
  } else {
    imageUrl = "https://i.imgur.com/9QyEVpN.jpg";
  }

  background.style.backgroundImage = `url('${imageUrl}')`;
}

document
  .getElementById("darkModeToggle")
  .addEventListener("change", function () {
    document.body.classList.toggle("dark-mode");
  });
