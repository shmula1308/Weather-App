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
const tempToggle = document.getElementById("temp-unit");
const clearScreenBtn = document.querySelector(".clear-data");
const clearScreenMobileBtn = document.querySelector(".clear-data-mobile")


let citiesData = [];
let tempUnit = [];
let citiesDisplayed = [];

let temp = {           // Object created to keep track when user changes measuring system from imperial to metric and vice versa
    unit: "celsius",
    checked: false
}




// An object constructor for each new city displayed on the screen
function CityWeatherData(name, id, icon, currentTemp, realFeel, desc, minTemp, maxTemp, wind, sunrise, sunset, humidity, pressure, visibility, cloudiness, lon, lat, timezone, dt) {
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
    this.dt = dt;
}


document.addEventListener("DOMContentLoaded", () => {
    //    When page load we check whether there is City data in the local storage from the previous session
    // if there is then we pull both citiesData and citiesDisplayed. CitiesDisplayed is to keep track whether the city is already displayed on the screen,
    // to prevent repating it on the screen.

    if (localStorage.getItem("cityData") === null) {
        citiesData = [];
        citiesDisplayed = [];
    } else {
        citiesDisplayed = JSON.parse(localStorage.getItem("cityDisp"));
        citiesData = JSON.parse(localStorage.getItem("cityData"));
        // This is to check whether in the previous session user has changed temp from C to F, and if they have we check the tempToggle back to Farenheit.

        if (JSON.parse(localStorage.getItem("tempObj") != null)) {
            if (temp.checked === true) {
                tempToggle.checked = true;
            }
        }
    }

    displayWeatherData();
})

// We first check wether the city search by user already exists in the array citiesDisplayed using array method includes(). We also
// convert the input toLowerCase(), jsut as we have done when storing a city in the array citiesDisplayed.

/* If city has not been displayed on screen, we do three things: push city in citiesDisplayed to keep track whats on the screen. We place it in local storage
 and then we call getWeatherData from the open weather API. And also clear the search field */

searchInput.addEventListener("keyup", (ev) => {
    if (ev.keyCode === 13) {
        if (citiesDisplayed.includes(searchInput.value.toLowerCase())) { // Here is where I prevent the city value being passed to getWeatherdata function, if it is already displayed on the screen
            alert("City is already displayed on the screen");
            searchInput.value = ""; // We clear the search field
        } else {
            citiesDisplayed.push(searchInput.value.toLowerCase())
            localStorage.setItem('cityDisp', JSON.stringify(citiesDisplayed));
            getWeatherData(searchInput.value);
            searchInput.value = "";
        }
    }
})

/* getWeatherData does the fetching by using the city name. We do this also by creating a Request object, and second parameter with options object. 
  If response is ok we call the object constructor from above and extract all the needed data from the JSON object returned from the API */

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
            let cityData = new CityWeatherData(data.name, data.id, data.weather[0].icon, data.main.temp, data.main.feels_like, data.weather[0].description, data.main.temp_min, data.main.temp_max, data.wind.speed, data.sys.sunrise, data.sys.sunset, data.main.humidity, data.main.pressure, data.visibility, data.clouds.all, data.coord.lon, data.coord.lat, data.timezone, data.dt);
            console.log(data)

            /* Before adding the data to the screen we check the temp object to see whether user has changed it to farenheit (checked it). If yes we convert all the
            temperature fields to farenheit. We push the cityData into the array and we update the locals storage. Then we add city to the screen by calling addToList() */

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



/* This function is used when we get the data from local storage. We iterate and call addToLIst() on every city inside the array, so that user gets back the cities displayed on the previous session */

function displayWeatherData() {
    citiesData.forEach(city => addToList(city));
}


/* Below we create a new element, we give it a class and an ID we get from the city object. The we use string literals to update the HTML with
the values from city object. On the delete icon element we place the name of the city, which we use to later identify which city has been deleted.
Time of every city is calculated by generateCurrentTime function depending on which timezone city is located. All temps are have Math.floor() method used on them. The weather description string is formated so that every word has its first letter capitalized by using the function changeCase(). Whatever these 
functions return becomes data of the weather app. Some data is taken directly from the city object, other data is calculated with functions and returned
Sunrise and sunset only provide us with the values for the places around the world calculated from our current position, so they are not correct. */

function addToList(city) {
    let cityDiv = document.createElement("div");
    cityDiv.classList.add("city-container");
    cityDiv.id = city.id;
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
            <span class="value">${Math.floor(city.minTemp)}${tempUnits(temp.unit)}</span>
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
            <span class="value">${lengthValueVisibility(city.visibility)} ${distance(temp.unit)}</span>
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

    /*Below after appending to the DOM we grab the parent element of all the cities, and then from it we get all the cities which we pass to createAccordion
    function below */

    weatherContainer.appendChild(cityDiv);

    const containerEl = document.querySelector(".current-weather-container");
    let allCities = containerEl.querySelectorAll(".city-container");

    createAccordion(allCities, containerEl)

}

/* Here I had an error I was unable to debug. Bascially, not every city container was expanding when clicked, only every other city . All of them were getting the eventListener attached but the .active class was not being added to all of them when the element was clicked. So I settled for this solution, not ideal, but better than the previous one. I need to understand this better */

function createAccordion(allCities, containerEl) {
    for (let i = 0; i < allCities.length; i++) {
        allCities[i].addEventListener("click", (ev) => {
            showDetails(ev.currentTarget)
            function showDetails(panel) {
                var openPanel = containerEl.querySelector(".active")
                if (openPanel) {
                    openPanel.classList.remove("active");
                }
                panel.classList.add("active");
                console.log(panel)
            }
        })
    }
}

/* Below Im adding listening for click events from the weather Container that hold all the cities to see wether the user has clicked the trash button.
 */

weatherContainer.addEventListener('click', (ev) => {
    if (ev.target.className === "fas fa-trash-alt trash") {
        let id = ev.target.id; // Im grabing the id - number (id's should not start with number,but for some reason it works in this case) from the trash icon to identify which city has been clicked.
        let parentEl = ev.target.parentElement.parentElement.parentElement; // Here I move three levels up to get to the parent element that hold the city. Ise there a better way to do this?
        weatherContainer.removeChild(parentEl);
        let tempCitiesData = citiesData.filter(obj => obj.id !== parseInt(id)); // Here Im using the filter method on the array holding the cities on the screen, Im getting only those that dont have the id of the element removed just now.
        citiesData = tempCitiesData;
        localStorage.setItem('cityData', JSON.stringify(citiesData)); // Then I'm stringifying the filtered array and storing it into local storage
        let city = ev.target.getAttribute("data-city"); // Here Im getting the value of the city-data attribute, in order filter out the city from the citiesDisplayed on the screen. This is an array that keeps track what cities are displayed on the screen , preventing the user from duplicating it.
        citiesDisplayed = citiesDisplayed.filter(c => c != city);
        localStorage.setItem('cityDisp', JSON.stringify(citiesDisplayed)); // I keep track of this also in the local storage
    }
})


function addZero(component) {
    return component < 10 ? "0" + component : component;
}

/* The function below I found online. By using the value of timezone provided by the API it calculates the local time in different cities around the world. I need to understand these date methods better. Also study the concept of utc and other related things from wikipedia. Also the function above addZero assist the function below */


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
    // let amOrPm = hours < 12 ? "AM" : "PM";
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

/* Below we listen for click events on tempToggle. We keep track of temp unit within an object named temp. Also we change the boolean 
depending on whether the button has been checked or unchecked. We need this value to remember whether user has checked the temptoggle or not, in the previous session. It is used when the browser is restared to check or uncheck the temptoggle. Everytime the tempToggle is clicked, the local storage is updated */


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

    /* Here we use the map method, which is perfect for these cases, to change all the temperaures in the objects inside the array citiesData, from c to f or vice versa. Here we also use the spread operator, to keep all the data in the object and only change the value of temperature. Calculations are done with the formula I got from google.*/
    citiesData = citiesData.map(city => {
        if (temp.unit === "celsius") {
            return { ...city, currentTemp: (city.currentTemp - 32) * (5 / 9), minTemp: (city.minTemp - 32) * (5 / 9), maxTemp: (city.maxTemp - 32) * (5 / 9), realFeel: (city.realFeel - 32) * (5 / 9), wind: city.wind / 1.609 }
        } else {
            return { ...city, currentTemp: (city.currentTemp * 9 / 5) + 32, minTemp: (city.minTemp * 9 / 5) + 32, maxTemp: (city.maxTemp * 9 / 5) + 32, realFeel: (city.realFeel * 9 / 5) + 32, wind: city.wind * 1.609 };
        }
    })

    /* Here we update the local storage immidiately after changing the tempretaure units. We then clear the container holding the cities and update it with the new values. We call  the function displaweatherData that iterates with for each loop and passes the city to addToList function that updated the DOM */

    /* By using the same key value we dont need to clear the loacla storage before updating it with the changed array. It overwrites the data, but you must use the same key, which is 'cityData' */
    localStorage.setItem('cityData', JSON.stringify(citiesData));
    weatherContainer.innerHTML = "";
    displayWeatherData()
})

// This is a button that resets everything, localStorage, screen and all the arrays.
clearScreenBtn.addEventListener("click", () => {
    localStorage.clear();
    weatherContainer.innerHTML = "";
    citiesData = [];
    citiesDisplayed = [];
})
// This is a smaller mobile button that resets everything, localStorage, screen and all the arrays.
clearScreenMobileBtn.addEventListener("click", () => {
    localStorage.clear();
    weatherContainer.innerHTML = "";
    citiesData = [];
    tempUnit = [];
    citiesDisplayed = [];
})

/* This is a function that capitalizes the first letter of every word in the sentence. So we take a string of words, split it split(" ")(with a space between strings), and turn it into an array. We use the map method and we capitalize the first letter by selecting it with charAt() string method, then we concatenate by using concat() method everything after the first letter at index 0. And then we join() it to get a string which is then returned and inserted in the HTML element */
function changeCase(weatherDesc) {
    return weatherDesc.split(" ").map(word => word.charAt(0).toUpperCase().concat(word.slice(1))).join(" ");
}

/* Find a way to get the correct sunrise and sunset values for all the cities around the world */

// function getSunRise(timezone, sunrise) {
//     // new Date(city.sunrise * 1000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }
//     return;
// }


// function getSunSet() {
//     return;
// }



// Here we convert km to miles and vice versa for visibility data
function lengthValueVisibility(value) {
    if (temp.unit === "celsius") {
        return Math.floor(value / 1000);
    } else {
        return Math.floor((value / 1000) / 1.609);
    }
}

// Here we convert km to miles and vice versa for wind data
function lengthValueWind(value) {
    if (temp.unit === "farenheit") {
        return Math.floor(value / 1.609);
    } else {
        return Math.floor(value * 1.609);
    }
}

// We convert the measuring units for wind
function lengthUnits(unit) {
    if (unit === "celsius") {
        return "km/h"
    } else {
        return "m/h"
    }
}
// We convert the measuring units for visibility, because it doesnt have the time component, only length
function distance(unit) {
    if (unit === "celsius") {
        return "km"
    } else {
        return "miles"
    }
}

//This provide c or f symbol/character

function tempUnits(unit) {
    if (unit === "celsius") {
        return "&#176C"
    } else {
        return "&#176F"
    }
}