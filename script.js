const iconMap = {
0:"☀️",
1:"🌤️",
2:"⛅",
3:"☁️",
45:"🌫️",
48:"🌫️",
61:"🌧️",
63:"🌧️",
65:"🌧️",
71:"❄️",
73:"❄️",
75:"❄️",
95:"⛈️"
};

let isFahrenheit = false;
let currentTemp = 0;

async function getWeather(cityParam){

let city = cityParam ||
document.getElementById("cityInput").value;

if(!city){
alert("Enter city name");
return;
}

saveSearch(city);

const geoUrl =
`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

const geoRes = await fetch(geoUrl);
const geoData = await geoRes.json();

if(!geoData.results){
alert("City not found");
return;
}

const lat = geoData.results[0].latitude;
const lon = geoData.results[0].longitude;

fetchWeather(lat,lon,city);
}

async function fetchWeather(lat,lon,city){

const url =
`https://api.open-meteo.com/v1/forecast?
latitude=${lat}
&longitude=${lon}
&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m
&daily=weather_code,temperature_2m_max,temperature_2m_min
&forecast_days=5
&timezone=auto`;

const response = await fetch(url);
const data = await response.json();

currentTemp =
data.current.temperature_2m;

document.getElementById("cityName").innerText = city;

document.getElementById("temp").innerText =
`${currentTemp}°C`;

document.getElementById("humidity").innerText =
`${data.current.relative_humidity_2m}%`;

document.getElementById("wind").innerText =
`${data.current.wind_speed_10m} km/h`;

document.getElementById("condition").innerText =
weatherText(data.current.weather_code);

document.getElementById("weatherIcon").innerText =
iconMap[data.current.weather_code] || "☁️";

document.getElementById("dateTime").innerText =
new Date().toLocaleString();

generateAlert(
currentTemp,
data.current.wind_speed_10m,
data.current.weather_code
);

changeBackground(data.current.weather_code);

showForecast(data.daily);
}

function weatherText(code){

if(code===0) return "Clear Sky";
if(code<=3) return "Cloudy";
if(code>=61 && code<=65) return "Rain";
if(code>=71 && code<=75) return "Snow";

return "Weather";
}

function showForecast(daily){

const forecast =
document.getElementById("forecast");

forecast.innerHTML="";

for(let i=0;i<5;i++){

forecast.innerHTML+=`

<div class="forecast-card">

<h3>
${new Date(daily.time[i])
.toLocaleDateString('en-US',{
weekday:'short'
})}
</h3>

<div>
${iconMap[daily.weather_code[i]] || "☁️"}
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

function generateAlert(temp,wind,code){

let alert="Weather looks good 😊";

if(temp>35)
alert="🔥 High temperature today";

if(code>=61)
alert="☔ Carry an umbrella";

if(wind>30)
alert="🌪️ Strong winds expected";

document.getElementById("alertBox").innerText =
alert;
}

function changeBackground(code){

if(code===0){

document.body.style.background =
"linear-gradient(135deg,#4F46E5,#06B6D4)";
}

else if(code>=61){

document.body.style.background =
"linear-gradient(135deg,#334155,#475569)";
}

else{

document.body.style.background =
"linear-gradient(135deg,#6366F1,#64748B)";
}
}

document
.getElementById("themeBtn")
.addEventListener("click",()=>{

document.body.classList.toggle("dark");
});

document
.getElementById("unitBtn")
.addEventListener("click",()=>{

if(!currentTemp) return;

isFahrenheit = !isFahrenheit;

document.getElementById("temp").innerText =
isFahrenheit
? `${((currentTemp*9/5)+32).toFixed(1)}°F`
: `${currentTemp}°C`;
});

document
.getElementById("locationBtn")
.addEventListener("click",()=>{

navigator.geolocation.getCurrentPosition(
async(position)=>{

const lat =
position.coords.latitude;

const lon =
position.coords.longitude;

fetchWeather(lat,lon,"Current Location");

});
});

function saveSearch(city){

let history =
JSON.parse(
localStorage.getItem("history")
) || [];

if(!history.includes(city))
history.unshift(city);

history = history.slice(0,5);

localStorage.setItem(
"history",
JSON.stringify(history)
);

renderHistory();
}

function renderHistory(){

const history =
JSON.parse(
localStorage.getItem("history")
) || [];

const div =
document.getElementById("history");

div.innerHTML="";

history.forEach(city=>{

div.innerHTML+=
`<button class="history-btn"
onclick="getWeather('${city}')">
${city}
</button>`;
});
}

renderHistory();