/* Attempted to setup google search box and link it to openweather API but I was unable to setup billing because Kosovo does not appear in the list of country options
The below code works though!
const searchInput = document.querySelector(".search-field");
const searchBox = new google.maps.places.SearchBox(searchInput);
const API_KEY = "6fa6c814e35daf0c81290c089a499869";
searchBox.addListener('places_changed', () => {
    const place = searchBox.getPlaces()[0];
    if (place === null) return;
    const latitude = place.geometry.location.lat();
    const longitude = place.geometry.location.lng();
    const uri = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
    let req = new Request(uri, { method: 'GET' })
    fetch(req).then(res => res.json()).then(data => {
        setWeatherData(data, place.formatted_address);
    })
}) */
const API_KEY = "6fa6c814e35daf0c81290c089a499869";
const searchInput = document.querySelector(".search-field");
const weatherContainer = document.querySelector(".current-weather-container");
const time = document.querySelector(".time");
let tempToggle = document.getElementById("temp-unit");

let citiesData = [];
let tempUnit = [];
let citiesDisplayed = [];

let temp = {
    unit: "celsius",
    checked: false
}


// tempUnit.push(temp);
// localStorage.setItem('tempUnit', JSON.stringify(tempUnit));

function CityWeatherData(name, id, icon, currentTemp, realFeel, desc, minTemp, maxTemp, wind, sunrise, sunset, humidity, pressure, visibility, cloudiness, lon, lat, timezone) {
    this.name = name;
    this.id = id;
    this.icon = icon;
    this.currentTemp = currentTemp;
    this.realFeel = realFeel;
    this.desc = desc;
    this.minTemp = minTemp;
    this.maxTemp = maxTemp;
    this.wind = wind;
    this.sunrise = sunrise;
    this.sunset = sunset;
    this.humidity = humidity;
    this.pressure = pressure;
    this.visibility = visibility;
    this.cloudiness = cloudiness;
    this.lon = lon;
    this.lat = lat;
    this.timezone = timezone;
}


document.addEventListener("DOMContentLoaded", () => {

    if (localStorage.getItem("cityData") === null) {
        citiesData = [];
        citiesDisplayed = [];
    } else {
        citiesDisplayed = JSON.parse(localStorage.getItem("cityDisp"));
        citiesData = JSON.parse(localStorage.getItem("cityData"));
        temp = JSON.parse(localStorage.getItem("tempObj"));
        if (temp.checked === true) {
            tempToggle.checked = true;
        }

    }
    // if (temp.unit === "farenheit") {
    //     citiesData = citiesData.map(city => {
    //         return { ...city, currentTemp: (city.currentTemp * 9 / 5) + 32, minTemp: (city.minTemp * 9 / 5) + 32, maxTemp: (city.maxTemp * 9 / 5) + 32, realFeel: (city.realFeel * 9 / 5) + 32, wind: city.wind * 1.609 };
    //     })
    // }

    displayWeatherData();
})


searchInput.addEventListener("keyup", (ev) => {
    if (ev.keyCode === 13) {
        if (citiesDisplayed.includes(searchInput.value.toLowerCase())) {
            alert("City is already displayed on the screen");
            searchInput.value = "";
        } else {
            citiesDisplayed.push(searchInput.value.toLowerCase())
            localStorage.setItem('cityDisp', JSON.stringify(citiesDisplayed));
            getWeatherData(searchInput.value);
            searchInput.value = "";
        }
    }
})

function getWeatherData(city) {
    let uri = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
    let req = new Request(uri, { method: "GET", mode: "cors" })

    fetch(req)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("BAD HTTP!")
            }
        })
        .then(data => {
            let cityData = new CityWeatherData(data.name, data.id, data.weather[0].icon, data.main.temp, data.main.feels_like, data.weather[0].description, data.main.temp_min, data.main.temp_max, data.wind.speed, data.sys.sunrise, data.sys.sunset, data.main.humidity, data.main.pressure, data.visibility, data.clouds.all, data.coord.lon, data.coord.lat, data.timezone);
            console.log(data)

            if (temp.unit === "farenheit") {
                cityData.currentTemp = (cityData.currentTemp * 9 / 5) + 32;
                cityData.minTemp = (cityData.minTemp * 9 / 5) + 32;
                cityData.maxTemp = (cityData.maxTemp * 9 / 5) + 32;
                cityData.realFeel = (cityData.realFeel * 9 / 5) + 32;
            }

            citiesData.push(cityData);
            localStorage.setItem('cityData', JSON.stringify(citiesData));


            addToList(cityData);

        })
        .catch(err => console.log("ERROR: ", err.message))
}


function displayWeatherData() {
    citiesData.forEach(city => addToList(city));
}


function addToList(city) {
    let cityDiv = document.createElement("div");
    cityDiv.classList.add(".city-container");
    cityDiv.style.backgroundColor = "#eee"
    cityDiv.id = city.id;
    cityDiv.style.marginBottom = "1em";
    console.log(city)
    cityDiv.innerHTML = `
    <div class="accordion-header">
    <div class="remove-button">
        <i class="fas fa-trash-alt trash" id=${city.id} data-city=${city.name.toLowerCase()}></i>
    </div>
    <div class="location">
        <p class="time">${generateCurrentTime(city.timezone)}</p>
        <p class="city">${city.name}</p>
    </div>
    <div class="icon">
        <img class="weather-icon" src="Icons/${city.icon}.png">
    </div>
    <div class="temp">
        ${Math.floor(city.currentTemp)
        }&#176;
    </div>
    <div class="realfeel">
        <span>RealFeel</span><span class="realfeel-temp"> ${Math.floor(city.realFeel)} &#176;</span>
    </div>
    <div class="description">
        ${changeCase(city.desc)}
    </div>
    <div class="chevron-down">
        <i class="fas fa-chevron-down"></i>
    </div>
</div>
<div class="accordion-details">
    <div class="left-content">
        <div class="min-temp details-container">
            <span class="key">Min-temp</span>
            <span class="value">${Math.floor(city.minTemp)} ${tempUnits(temp.unit)}</span>
        </div>
        <div class="max-temp details-container">
            <span class="key">Max-temp</span>
            <span class="value">${Math.floor(city.maxTemp)}${tempUnits(temp.unit)}</span>
        </div>
        <div class="wind details-container">
            <span class="key">Wind</span>
            <span class="value">${lengthValueWind(city.wind)} ${lengthUnits(temp.unit)}</span>
        </div>
        <div class="sunrise details-container">
            <span class="key">Sunrise</span>
            <span class="value">${new Date(city.sunrise * 1000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="sunset details-container">
            <span class="key">Sunset</span>
            <span class="value">${new Date(city.sunset * 1000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    </div>
    <div class="right-content">
        <div class="humidity details-container">
            <span class="key">Humidity</span>
            <span class="value">${city.humidity} %</span>
        </div>
        <div class="pressure details-container">
            <span class="key">Pressure</span>
            <span class="value">${city.pressure} hPa</span>
        </div>
        <div class="visibility details-container">
            <span class="key">Visibility</span>
            <span class="value">${lengthValueVisibility(city.visibility)} ${lengthUnits(temp.unit)}</span>
        </div>
        <div class="cloudiness details-container">
            <span class="key">Cloudiness</span>
            <span class="value">${city.cloudiness} %</span>
        </div>
        <div class="lonLat details-container">
            <span class="key">Longitude/Latitude</span>
            <span class="value">lon: ${city.lon} lat: ${city.lat}</span>
        </div>
    </div>
</div>`;

    weatherContainer.appendChild(cityDiv);
}

weatherContainer.addEventListener('click', (ev) => {
    if (ev.target.className === "fas fa-trash-alt trash") {
        let id = ev.target.id;
        let parentEl = ev.target.parentElement.parentElement.parentElement;
        weatherContainer.removeChild(parentEl);
        tempCitiesData = citiesData.filter(obj => obj.id !== parseInt(id));
        citiesData = tempCitiesData;
        localStorage.setItem('cityData', JSON.stringify(citiesData));
        let city = ev.target.getAttribute("data-city");
        citiesDisplayed = citiesDisplayed.filter(c => c != city);
        localStorage.setItem('cityDisp', JSON.stringify(citiesDisplayed));
    }
})


function addZero(component) {
    return component < 10 ? "0" + component : component;
}


function generateCurrentTime(timezone) {
    let now = new Date()
    localTime = now.getTime()
    localOffset = now.getTimezoneOffset() * 60000
    utc = localTime + localOffset
    let city = utc + (1000 * timezone)
    let nd = new Date(city)
    let hours = nd.getHours();
    let minutes = nd.getMinutes();
    let seconds = nd.getSeconds();
    let amOrPm = hours < 12 ? "AM" : "PM";
    hours = addZero(hours);
    minutes = addZero(minutes);
    seconds = addZero(seconds);
    // hours = (hours === 0) ? 12 : (hours > 12 ? hours - 12 : hours);
    return `${hours}:${minutes}`;



    /* Obtain current local time
    Find local time offset
    Obtain current UTC time
    Obtain destination city's offset in hours and convert to milliseconds
    convert to readable format */
}


tempToggle.addEventListener("click", () => {

    if (temp.unit === "celsius") {
        temp.unit = "farenheit"
        temp.checked = true;
        localStorage.setItem('tempObj', JSON.stringify(temp));

    } else {
        temp.unit = "celsius"
        temp.checked = false;
        localStorage.setItem('tempObj', JSON.stringify(temp));
    }

    citiesData = citiesData.map(city => {
        if (temp.unit === "celsius") {
            return { ...city, currentTemp: (city.currentTemp - 32) * (5 / 9), minTemp: (city.minTemp - 32) * (5 / 9), maxTemp: (city.maxTemp - 32) * (5 / 9), realFeel: (city.realFeel - 32) * (5 / 9), wind: city.wind / 1.609 }
        } else {
            return { ...city, currentTemp: (city.currentTemp * 9 / 5) + 32, minTemp: (city.minTemp * 9 / 5) + 32, maxTemp: (city.maxTemp * 9 / 5) + 32, realFeel: (city.realFeel * 9 / 5) + 32, wind: city.wind * 1.609 };
        }
    })

    // localStorage.clear();
    localStorage.setItem('cityData', JSON.stringify(citiesData));
    weatherContainer.innerHTML = "";
    displayWeatherData()

})



function changeCase(weatherDesc) {
    return weatherDesc.split(" ").map(word => word.charAt(0).toUpperCase().concat(word.slice(1))).join(" ");
}

function getSunRise(timezone, sunrise) {
    return;
}


function getSunSet() {
    return;
}

function lengthValueVisibility(value) {
    if (temp.unit === "celsius") {
        return value / 1000;
    } else {
        return Math.floor((value / 1000) / 1.609);
    }
}

function lengthValueWind(value) {
    if (temp.unit === "farenheit") {
        return Math.floor(value / 1.609);
    } else {
        return Math.floor(value * 1.609);
    }
}

function lengthUnits(unit) {
    if (unit === "celsius") {
        return "km/h"
    } else {
        return "m/h"
    }
}

function tempUnits(unit) {
    if (unit === "celsius") {
        return "&#176C"
    } else {
        return "&#176F"
    }
}