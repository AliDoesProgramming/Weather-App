const apiKey = '82d441ca2286fa3d6f5692e35772c2ca';

document.addEventListener('wheel', function(event) {
    console.log('Wheel event fired', event);
    if (event.deltaY > 0) {
        window.scrollBy(0, 100);
    } else {
        window.scrollBy(0, -100);
    }
});

function getWeather() {
    const city = document.getElementById('city').value;

    if (!city) {
        alert('Please enter a city');
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    // Fetch current weather
    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            alert('Error fetching current weather data. Please try again.');
        });

    // Fetch hourly forecast
    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast(data.list);
        })
        .catch(error => {
            console.error('Error fetching hourly forecast data:', error);
            alert('Error fetching hourly forecast data. Please try again.');
        });
}

function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    const additionalInfoDiv = document.getElementById('additional-info');
    const formattedDateDiv = document.getElementById('formatted-date'); // Target the formatted-date div

    // Clear previous content
    weatherInfoDiv.innerHTML = '';
    hourlyForecastDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';
    additionalInfoDiv.innerHTML = '';
    formattedDateDiv.innerHTML = ''; // Clear previous date

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.name;
        const temperature = Math.round(data.main.temp - 273.15); // Convert to Celsius
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;

        // Wind speed in km/h and wind direction
        const windSpeed = (data.wind.speed * 3.6).toFixed(1); // Convert m/s to km/h
        const windDeg = data.wind.deg;
        const windDirection = getCardinalDirection(windDeg); // Convert degrees to cardinal direction

        // Map OpenWeatherMap icon codes to your custom icon filenames
        const customIcons = {
            '01d': 'icons/clear-day.png',
            '01n': 'icons/clear-night.png',
            '02d': 'icons/partly-cloudy-day.png',
            '02n': 'icons/partly-cloudy-night.png',
            '03d': 'icons/cloudy.png',
            '03n': 'icons/cloudy.png',
            '04d': 'icons/overcast.png',
            '04n': 'icons/overcast.png',
            '09d': 'icons/showers.png',
            '09n': 'icons/showers.png',
            '10d': 'icons/rain-day.png',
            '10n': 'icons/rain-night.png',
            '11d': 'icons/thunderstorm.png',
            '11n': 'icons/thunderstorm.png',
            '13d': 'icons/snow.png',
            '13n': 'icons/snow.png',
            '50d': 'icons/mist.png',
            '50n': 'icons/mist.png',
        };

        const iconUrl = customIcons[iconCode] || 'icons/default.png'; // Default icon if no match

        // Set temperature-based color
        let textColor;
        if (temperature <= 0) {
            textColor = '#94eefa'; // freezing temperatures
        } else if (temperature <= 10) {
            textColor = '#52b3e0'; // cold weather
        } else if (temperature <= 20) {
            textColor = '#efe954'; // mild weather
        } else if (temperature <= 32) {
            textColor = '#e47636'; // warm weather
        } else {
            textColor = '#c81f1f'; // hot weather
        }

        const temperatureHTML = ` 
            <p>${temperature}°C</p>
        `;

        // Modify the city name style here to make it bigger
        const cityNameHTML = `<p style="font-size: 50px; font-weight: bolder;">${cityName}</p>`;  // Make city name bigger

        const weatherHtml = ` 
            ${cityNameHTML} 
            <p>${description}</p>
        `;

        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHtml;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;

        const tempParagraph = tempDivInfo.querySelector('p');
        if (tempParagraph) {
            tempParagraph.style.color = textColor;
        }

        // Add wind speed, humidity, and pressure to the additional-info div
        const humidity = data.main.humidity;
        const pressure = data.main.pressure;

        let windSpeedHTML = `Wind Speed: ${windSpeed} km/h (${windDirection})`;
        if (windSpeed > 30) {
            windSpeedHTML += " <span style='color: red; font-weight: bold;'>Dangerous!</span>";
        }

        additionalInfoDiv.innerHTML = `
            <p id="humidity">Humidity: ${humidity}%</p>
            <p id="pressure">Pressure: ${pressure} hPa</p>
            <p id="windspeed">${windSpeedHTML}</p>
        `;

        // Display the formatted date
        const currentDate = new Date();
        const formattedDate = getFormattedDate(currentDate.getTime() / 1000); // Pass current timestamp
        formattedDateDiv.innerHTML = formattedDate; // Show formatted date

        showImage();
    }
}



function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    // Clear previous hourly forecast
    hourlyForecastDiv.innerHTML = '';

    // Iterate through the hourly data (3-hour intervals provided by OpenWeatherMap)
    for (let i = 0; i < 20; i++) {  // Display the next 8 data points (for a 24-hour period)
        const item = hourlyData[i];
        const dateTime = new Date(item.dt * 1000); // Convert timestamp to milliseconds
        const hour = dateTime.getHours();
        const temperature = Math.round(item.main.temp - 273.15); // Convert to Celsius
        const iconCode = item.weather[0].icon;

        // Wind speed in km/h and wind direction
        const windSpeed = (item.wind.speed * 3.6).toFixed(1); // Convert m/s to km/h
        const windDeg = item.wind.deg;
        const windDirection = getCardinalDirection(windDeg); // Convert degrees to cardinal direction

        // Map OpenWeatherMap icon codes to custom icons
        const customHourlyIcons = {
            '01d': 'icons/clear-day.png',
            '01n': 'icons/clear-night.png',
            '02d': 'icons/partly-cloudy-day.png',
            '02n': 'icons/partly-cloudy-night.png',
            '03d': 'icons/cloudy.png',
            '03n': 'icons/cloudy.png',
            '04d': 'icons/overcast.png',
            '04n': 'icons/overcast.png',
            '09d': 'icons/showers.png',
            '09n': 'icons/showers.png',
            '10d': 'icons/rain-day.png',
            '10n': 'icons/rain-night.png',
            '11d': 'icons/thunderstorm.png',
            '11n': 'icons/thunderstorm.png',
            '13d': 'icons/snow.png',
            '13n': 'icons/snow.png',
            '50d': 'icons/mist.png',
            '50n': 'icons/mist.png',
        };

        const iconUrl = customHourlyIcons[iconCode] || 'icons/default.png'; // Fallback to default if no match

        // Create hourly forecast item HTML
        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span>${temperature}°C</span>
                <div class="wind-info">Wind: ${windSpeed} km/h (${windDirection})</div> <!-- Display wind speed and direction -->
            </div>
        `;

        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    }
}

function getCardinalDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

function getFormattedDate(timestamp) {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to JavaScript Date object

    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true  // To use 12-hour format with AM/PM
    };
    return date.toLocaleDateString('en-US', options);
}

function showImage() {
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.style.display = 'block';
}
