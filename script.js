let form = document.querySelector(".search-form");
let searchInput = document.querySelector("#search-box");
const api_key = 'a5afc3b297msh0d43716776f5537p16cd98jsnde56fe4e0ce4'
const baseURL = 'https://weatherapi-com.p.rapidapi.com/forecast.json';


// main selection
let cityname = document.querySelector(".main .city_name");
let temperature = document.querySelector(".main .temperature");
let temp_desc = document.querySelector(".main .temp_desc");
let img = document.querySelector(".main img");
let local_date_time = document.querySelector(".main .local_date_time")

// todays forecast selection
let forecast_time = document.querySelectorAll(".todays_forecast .box .time");
let forecast_img = document.querySelectorAll(".todays_forecast .box img");
let forecast_temp = document.querySelectorAll(".todays_forecast .box .temp");


// more info selection
let feels_like = document.querySelector(".more_info .box.one .heading_data")
let humidity = document.querySelector(".more_info .box.two .heading_data")
let UV = document.querySelector(".more_info .box.three .heading_data")
let wind_speed = document.querySelector(".more_info .box.four .heading_data")


// 7 days forecast selection
let forecast_day = document.querySelectorAll(".right .day")
let forecast_day_min_max_temp = document.querySelectorAll(".right .min_max");
let forecast_day_img = document.querySelectorAll(".right img");
let forecast_day_text = document.querySelectorAll(".right .condition_text");


const now = new Date();
const date = now.toLocaleDateString('en-CA');
const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  .replace(/am|pm/i, match => match.toUpperCase());;


const update_time = () => {
  document.querySelector(".today .date").innerText = `DATE : ${date}`;
  document.querySelector(".today .time").innerText = `TIME : ${time}`
}

window.onload = async () => {
  update_time();
  setInterval(update_time, 60000);
  await getWeather("surat");
  await get7daysWeather("surat");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault()
  const city = searchInput.value;
  searchInput.value = "";
  clearPreviousData();
  await getWeather(city);
  await get7daysWeather(city)
})


async function getWeather(city) {
  const url1 = `${baseURL}?q=${city}&days=2`
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': api_key,
      'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url1, options);
    const result = await response.json();
    setData(result);
  } catch (error) {
    console.error(error);
  }
}

let next7days = [];
let weatherData = [];
async function get7daysWeather(city) {
  next7days = [];
  weatherData = [];
  let now = new Date();
  for (let i = 1; i <= 7; i++) {
    let nextDate = new Date(now);
    nextDate.setDate(now.getDate() + i);
    next7days.push(nextDate.toISOString().split('T')[0]);
  }

  for (let i = 0; i < 7; i++) {
    const url2 = `${baseURL}?q=${city}&dt=${next7days[i]}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': api_key,
        'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url2, options);
      const result = await response.json();
      weatherData.push(result);
    } catch (error) {
      console.error(error);
    }
  }
  set7daysData(weatherData);
}


function setData(result) {
  let last_updated = result.current.last_updated;
  let last_updated_hour = parseInt(last_updated.split(' ')[1].split(':')[0]);
  let next5hours = [];
  for (let i = 1; i <= 5; i++) {
    let hourIndex = (last_updated_hour + i) % 24;
    let hourData = result.forecast.forecastday[0].hour[hourIndex];
    next5hours.push(hourData);
  }

  //main section
  cityname.innerText = result.location.name
  temperature.innerText = `${result.current.temp_c}° C / ${result.current.temp_f}° F`
  temp_desc.innerText = result.current.condition.text;
  img.src = result.current.condition.icon
  local_date_time.innerText = result.current.last_updated


  //todays forecast section
  forecast_time.forEach((element, index) => {
    if (index < next5hours.length) {
      let timeOnly = next5hours[index].time.split(' ')[1];
      element.innerText = timeOnly;
    }
  })

  forecast_img.forEach((element, index) => {
    if (index < next5hours.length) {
      let src = next5hours[index].condition.icon;
      element.src = src;
    }
  })

  forecast_temp.forEach((element, index) => {
    if (index < next5hours.length) {
      let temp = next5hours[index].temp_c;
      element.innerText = `${temp}° C`;
    }
  })

  // more info selection
  feels_like.innerText = `${result.current.feelslike_c}° C / ${result.current.feelslike_f}° F`
  humidity.innerText = `${result.current.humidity}%`
  UV.innerText = `${result.current.uv}`
  wind_speed.innerText = `${result.current.wind_kph} KM/H ${result.current.wind_degree} ${result.current.wind_dir}`
}

function set7daysData(weatherData) {
  weatherData.forEach((result, index) => {
    if (index < next7days.length) {
      const forecast_day = document.querySelectorAll(".right .day")[index];
      const forecast_day_img = document.querySelectorAll(".right img")[index];
      const forecast_day_min_max_temp = document.querySelectorAll(".right .min_max")[index];
      const forecast_day_text = document.querySelectorAll(".right .condition_text")[index];

      if (forecast_day && forecast_day_img && forecast_day_min_max_temp && forecast_day_text) {
        forecast_day.innerText = result.forecast.forecastday[0].date;
        forecast_day_min_max_temp.innerText = `MIN/MAX : ${result.forecast.forecastday[0].day.mintemp_c}/${result.forecast.forecastday[0].day.maxtemp_c} °C`;
        forecast_day_img.src = result.forecast.forecastday[0].day.condition.icon;
        forecast_day_text.innerText = result.forecast.forecastday[0].day.condition.text;
      }
    }
  })
};

function clearPreviousData() {
  document.querySelectorAll(".right .day").forEach(element => element.innerText = "loading...");
  document.querySelectorAll(".right .min_max").forEach(element => element.innerText = "");
  document.querySelectorAll(".right img").forEach(element => element.src = "https://media.tenor.com/tga0EoNOH-8AAAAM/loading-load.gif");
  document.querySelectorAll(".right .condition_text").forEach(element => element.innerText = "")
}