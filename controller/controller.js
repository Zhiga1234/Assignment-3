const fetchWeatherData = async (city, apiKey) => {
    const currentWeatherApi =' https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}';
    const forecastApi = 'https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&cnt=14&appid=${apiKey}';

    try {
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherApi),
            fetch(forecastApi),
        ]);

        if (!currentWeatherResponse.ok || !forecastResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const [currentWeather, forecast] = await Promise.all([
            currentWeatherResponse.json(),
            forecastResponse.json(),
        ]);

        return { currentWeather, forecast };
    } catch (error) {
        throw new Error(error.message);
    }
};

const weatherController = {
    getWeather: async (req, res) => {
        const { city } = req.params;
        const apiKey = process.env.OPENWEATHER_API_KEY || 'a2b8082a0ac50246506c542822439b02';

        if (!city) {
            return res.status(400).json({ error: 'City parameter is required' });
        }

        try {
            const weatherData = await fetchWeatherData(city, apiKey);
            res.json(weatherData);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};

module.exports = weatherController;