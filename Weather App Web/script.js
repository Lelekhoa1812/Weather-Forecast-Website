// Query selector section
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const resultsDiv = document.querySelector(".results");
const body = document.body;
const title = document.querySelector("h1");

const API_KEY = "88f987e710fcb56cf83d1bf295d3f707"; // API key for OpenWeatherMap API (username: liamle1812, yup, it just a free account limited on searching attempt! ^^)
const API_URL = "https://api.openweathermap.org/data/2.5/weather?"; // URL for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) { // HTML for the main weather card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { // HTML for the other five-day forecast card
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}

// Obtain and process weather details from given coordination of that city input and process data
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });

        // Determine time of day and weather conditions
        const currentWeather = fiveDaysForecast[0];
        const localTime = new Date(currentWeather.dt_txt).getHours(); // Get local time of the city
        const isDaytime = localTime >= 6 && localTime < 18; // Between 6.00 and 18.00 is daytime, else is nighttime
        const weatherMain = currentWeather.weather[0].main.toLowerCase();

        // Update background image and color based on weather and time of day
        let backgroundImage;
        let backgroundColor;
        if (isDaytime) {
            if (weatherMain.includes("rain")) {
                backgroundImage = "rainday.avif";
                backgroundColor = "#878787";
            } else if (weatherMain.includes("clouds")) {
                backgroundImage = "cloudyday.jpg";
                backgroundColor = "#878787";
            } else if (weatherMain.includes("snow")) {
                backgroundImage = "snowday.jpeg";
                backgroundColor = "#3d78a0";
            } else {
                backgroundImage = "sunny.jpg";
                backgroundColor = "#3d78a0";
            }
        } else {
            if (weatherMain.includes("rain")) {
                backgroundImage = "rainnight.jpg";
                backgroundColor = "#471177";
            } else if (weatherMain.includes("clouds")) {
                backgroundImage = "cloudynight.jpg";
                backgroundColor = "#471177";
            } else if (weatherMain.includes("snow")) {
                backgroundImage = "snownight.jpg";
                backgroundColor = "#3d78a0";
            } else {
                backgroundImage = "night.jpg";
                backgroundColor = "#471177";
            }
        }
        body.style.backgroundImage = `url('${backgroundImage}')`;
        title.style.backgroundColor = backgroundColor;
        currentWeatherDiv.style.backgroundColor = backgroundColor;

    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!"); // Error catching response as alert message
    });
}

// List city options, casing a city name from input shared with others in different countries
const displayCityOptions = (cities) => {
    resultsDiv.innerHTML = ""; // Clear previous results
    cities.forEach(city => {
        const cityOption = document.createElement("div");
        cityOption.classList.add("city-option");
        cityOption.textContent = `${city.name}, ${city.country}`;
        cityOption.addEventListener("click", () => {
            resultsDiv.innerHTML = ""; // Clear results when a city is selected
            getWeatherDetails(city.name, city.lat, city.lon);
        });
        resultsDiv.appendChild(cityOption);
    });
}

// get the city's coordination then append to the corresponding weather data
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;
    
    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
        if (data.length === 0) {
            alert("No coordinates found for the city!"); // Alert user if no matching coordinates found
            return;
        }
        displayCityOptions(data); // Display city options if found
    }).catch(() => {
        alert("An error occurred while fetching the city coordinates!"); // Error catching response as alert message
    });
}

// use of the location button to get the user's current location and process weather data
const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

        fetch(API_URL).then(response => response.json()).then(data => {
            if (data.length === 0) {
                alert("No coordinates found for the city!"); // Alert user if no matching coordinates found
                return;
            }
            const city = data[0];
            getWeatherDetails(city.name, city.lat, city.lon); // Get weather details using current location
        }).catch(() => {
            alert("An error occurred while fetching the city coordinates!"); // Error catching response as alert message
        });
    }, () => {
        alert("Unable to get your location! Please check your location settings."); // Error catching response as alert message
    });
}

// Add event listeners
searchButton.addEventListener("click", getCityCoordinates); // Process city input
locationButton.addEventListener("click", getUserLocation); // Process user location
cityInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        getCityCoordinates(); // Process city input when Enter key pressed
    }
});
