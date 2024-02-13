
let weather = {
    apiKey: "a2b8082a0ac50246506c542822439b02",
    fetchWeather: function (city) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${this.apiKey}`)

            .then((response) => response.json())
            .then((data) => {
                this.displayWeather(data);
                return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&cnt=14&appid=${this.apiKey}`);
            })
            .then((response) => response.json())
            .then((data) => this.displayForecast(data))
            .catch((error) => console.error("Error fetching data:", error));
    },
    displayWeather: function (data) {
        const { name, sys } = data;
        const { humidity, temp } = data.main;
        const { description, icon } = data.weather[0];
        const { speed } = data.wind;

        document.querySelector(".city").innerText = `Weather in ${name}, ${sys.country}`;
        document.querySelector(".temp").innerText = `${temp}°C`;
        document.querySelector(".icon").src = `https://openweathermap.org/img/wn/${icon}.png`;
        document.querySelector(".desc").innerText = description;
        document.querySelector(".humidity").innerText = `Humidity: ${humidity}%`;
        document.querySelector(".wind-speed").innerText = `Wind Speed: ${speed} m/s`;
        document.body.style.backgroundImage = `url('https://source.unsplash.com/1600x900/?${name}')`;
    },
    displayForecast: function (data) {
        const forecastContainer = document.querySelector(".forecast-container");
        forecastContainer.innerHTML = "";

        for (let i = 0; i < data.list.length; i++) {
            const forecastData = data.list[i];
            const date = new Date(forecastData.dt * 1000);
            const day = date.toLocaleDateString("en-US", { weekday: "short" });
            const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            const forecastItem = document.createElement("div");
            forecastItem.classList.add("forecast-item");

            forecastItem.innerHTML = `
                <div class="forecast-day">${day}</div>
                <div class="forecast-temp">${forecastData.main.temp}°C</div>
                <img src="https://openweathermap.org/img/wn/${forecastData.weather[0].icon}.png" class="forecast-icon" />
            `;

            forecastContainer.appendChild(forecastItem);
        }
    },
    search: function () {
        const city = document.querySelector(".search-input").value;
        this.fetchWeather(city);
    },
};

window.addEventListener('load', () => {
    let long;
    let lat;

    navigator.permissions.query({ name: 'geolocation' })
        .then(data => {
            if (data.state == "denied") {
                alert("");
                document.querySelector('.city').style.color = "red";
                document.querySelector('.city').textContent = "";
            }
        });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            long = position.coords.longitude;
            lat = position.coords.latitude;
            let temperatureDegree = document.querySelector('.temperature-degree');
            let pais = document.querySelector('.location-country');
            let locationTimezone = document.querySelector('.location-timezone');
            let temperatureSensation = document.querySelector('.temperature-feel_like');
            let temperatureIcon = document.querySelector('.location-icon');
            const apikey = 'a2b8082a0ac50246506c542822439b02';
            const api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apikey}&units=metric`;

            fetch(api)
                .then(response => response.json())
                .then(data => {
                    var temperature = Math.floor(data.main.temp);
                    var sensacionTermica = Math.floor(data.main.feels_like);
                    const city = data.name;
                    const country = data.sys.country;
                    const icon = data.weather[0].icon;

                    temperatureDegree.textContent = 'Temp: ' + temperature;
                    temperatureSensation.textContent = 'Feel like: ' + sensacionTermica;
                    locationTimezone.textContent = 'City: ' + city;
                    pais.textContent = 'Country: ' + country;

                    temperatureIcon.setAttribute('src', `http://openweathermap.org/img/wn/${icon}@2x.png`);
                });
        });
    }

    document.querySelector(".search-icon").addEventListener("click", function () {
        weather.search();
    });

    document.querySelector(".search-input").addEventListener("keyup", function (event) {
        if (event.key == "Enter") {
            weather.search();
        }
    });
});
