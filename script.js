const iconMap = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "❄️",
  73: "❄️",
  75: "❄️",
  95: "⛈️"
};

let currentTemp = 0;
let isFahrenheit = false;
let chartInstance = null;

async function getWeather(cityParam) {

  const city =
    cityParam ||
    document.getElementById("cityInput").value.trim();

  if (!city) {
    alert("Please enter a city");
    return;
  }

  showLoader();

  try {

    saveSearch(city);

    const geoResponse =
      await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );

    const geoData =
      await geoResponse.json();

    if (!geoData.results) {
      alert("City not found");
      hideLoader();
      return;
    }

    const lat =
      geoData.results[0].latitude;

    const lon =
      geoData.results[0].longitude;

    fetchWeather(
      lat,
      lon,
      city
    );

  } catch (error) {

    alert("Something went wrong");
    hideLoader();
  }
}

async function fetchWeather(
  lat,
  lon,
  city
) {

  const url =
    `https://api.open-meteo.com/v1/forecast?
latitude=${lat}
&longitude=${lon}
&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure
&hourly=temperature_2m
&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max
&forecast_days=5
&timezone=auto`;

  const response =
    await fetch(url);

  const data =
    await response.json();

  currentTemp =
    data.current.temperature_2m;

  document.getElementById("cityName")
    .innerText = city;

  document.getElementById("temp")
    .innerText = `${currentTemp}°C`;

  document.getElementById("humidity")
    .innerText =
    `${data.current.relative_humidity_2m}%`;

  document.getElementById("wind")
    .innerText =
    `${data.current.wind_speed_10m} km/h`;

  document.getElementById("pressure")
    .innerText =
    `${data.current.surface_pressure} hPa`;

  document.getElementById("visibility")
    .innerText =
    "10 km";

  document.getElementById("uv")
    .innerText =
    Math.floor(Math.random()*11);

  document.getElementById("rainChance")
    .innerText =
    `${data.daily.precipitation_probability_max[0]}%`;

  document.getElementById("sunrise")
    .innerText =
    new Date(
      data.daily.sunrise[0]
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

  document.getElementById("sunset")
    .innerText =
    new Date(
      data.daily.sunset[0]
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

  document.getElementById("condition")
    .innerText =
    weatherText(
      data.current.weather_code
    );

  document.getElementById("weatherIcon")
    .innerText =
    iconMap[
      data.current.weather_code
    ] || "☁️";

  document.getElementById("dateTime")
    .innerText =
    new Date().toLocaleString();

  generateAlert(
    currentTemp,
    data.current.wind_speed_10m,
    data.current.weather_code
  );

  changeBackground(
    data.current.weather_code
  );

  showForecast(
    data.daily
  );

  createChart(
    data.hourly.temperature_2m.slice(0,24)
  );

  fetchAQI(
    lat,
    lon
  );

  hideLoader();
}

async function fetchAQI(
  lat,
  lon
){

  try{

    const response =
      await fetch(
`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`
      );

    const data =
      await response.json();

    const aqi =
      data.current.us_aqi;

    const card =
      document.createElement("div");

    card.className =
      "highlight-card";

    card.innerHTML =
      `
      🌿
      <h3>AQI</h3>
      <p>${aqi}</p>
      `;

  }catch(e){}
}

function createChart(data){

  const ctx =
    document.getElementById(
      "tempChart"
    );

  if(chartInstance){
    chartInstance.destroy();
  }

  chartInstance =
    new Chart(ctx,{
      type:"line",

      data:{
        labels:[
          ...Array(24)
        ].map((_,i)=>i),

        datasets:[{
          label:"Temperature °C",
          data:data,
          tension:.4
        }]
      }
    });
}

function weatherText(code){

  if(code===0)
    return "Clear Sky";

  if(code<=3)
    return "Cloudy";

  if(code>=61 && code<=65)
    return "Rain";

  if(code>=71 && code<=75)
    return "Snow";

  if(code>=95)
    return "Thunderstorm";

  return "Weather";
}

function generateAlert(
  temp,
  wind,
  code
){

  let msg =
    "Weather looks pleasant 😊";

  if(temp > 35){

    msg =
      "🔥 High temperature today. Stay hydrated.";
  }

  if(code >= 61){

    msg =
      "☔ Carry an umbrella today.";
  }

  if(wind > 30){

    msg =
      "🌪 Strong winds expected.";
  }

  document
    .getElementById("alertBox")
    .innerText = msg;
}

function showForecast(
  daily
){

  const forecast =
    document.getElementById(
      "forecast"
    );

  forecast.innerHTML = "";

  for(let i=0;i<5;i++){

    forecast.innerHTML +=

    `
    <div class="forecast-card">

      <h3>
      ${new Date(
        daily.time[i]
      ).toLocaleDateString(
        "en-US",
        {weekday:"short"}
      )}
      </h3>

      <div class="forecast-icon">
      ${iconMap[
        daily.weather_code[i]
      ] || "☁️"}
      </div>

      <p>
      ${daily.temperature_2m_max[i]}°
      /
      ${daily.temperature_2m_min[i]}°
      </p>

    </div>
    `;
  }
}

function changeBackground(code){

const rain =
document.querySelector(".rain");

if(code === 0){

document.body.style.background =
"linear-gradient(135deg,#4facfe,#00f2fe)";

if(rain){
rain.style.display = "none";
}

}

else if(code >= 61 && code <= 65){

document.body.style.background =
"linear-gradient(135deg,#434343,#000000)";

if(rain){
rain.style.display = "block";
}

}

else{

document.body.style.background =
"linear-gradient(135deg,#667eea,#764ba2)";

if(rain){
rain.style.display = "none";
}

}
}

document
.getElementById("themeBtn")
.addEventListener(
"click",
()=>{

  document.body.classList.toggle("dark");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark")
  );
});

if(
localStorage.getItem("theme")
==="true"
){

  document.body.classList.add(
    "dark"
  );
}

document
.getElementById("locationBtn")
.addEventListener("click", () => {

navigator.geolocation.getCurrentPosition(

async (position) => {

const lat = position.coords.latitude;
const lon = position.coords.longitude;

const response = await fetch(
`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
);

const data = await response.json();

const cityName =
data.city ||
data.locality ||
"Current Location";

// Show city in search box
document.getElementById("cityInput").value = cityName;

// Save search
saveSearch(cityName);

// Fetch weather
fetchWeather(
lat,
lon,
cityName
);

});

});

function saveSearch(city){

let history =
JSON.parse(
localStorage.getItem(
"history"
)
) || [];

if(!history.includes(city)){

history.unshift(city);
}

history =
history.slice(0,5);

localStorage.setItem(
"history",
JSON.stringify(history)
);

renderHistory();
}

function renderHistory(){

const history =
JSON.parse(
localStorage.getItem(
"history"
)
) || [];

const div =
document.getElementById(
"history"
);

div.innerHTML = "";

history.forEach(city=>{

div.innerHTML +=
`
<button
class="history-btn"
onclick="getWeather('${city}')">

${city}

</button>
`;
});
}

function showLoader(){

document.getElementById(
"weatherIcon"
).innerHTML =
'<div class="loader"></div>';
}

function hideLoader(){

}

renderHistory();