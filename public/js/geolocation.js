window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const long = position.coords.longitude;
            const apikey = 'a2b8082a0ac50246506c542822439b02'; 
            const api = 'https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apikey}&units=metric';

            fetch(api)
                .then(response => response.json())
                .then(data => {
                    const temperature = Math.floor(data.main.temp);
                    const sensacionTermica = Math.floor(data.main.feels_like);
                    const city = data.name;
                    const country = data.sys.country;
                    const icon = data.weather[0].icon;

                    console.log('Temp:', temperature);
                    console.log('Feel like:', sensacionTermica);
                    console.log('City:', city);
                    console.log('Country:', country);
                    console.log('Icon:', icon);
                })
                .catch(error => console.error('Error fetching weather data:', error));
        }, error => {
            console.error('Error getting location:', error);
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
});