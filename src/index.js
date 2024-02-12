const express = require("express");
const path = require("path");
const collection = require("./config.js");
const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectId;
const NewsAPI = require('newsapi');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3030;

const OPENWEATHERMAP_API_KEY = 'a2b8082a0ac50246506c542822439b02';
const VISUAL_CROSSING_API_KEY = '55db72521367f3be568fa85cad349de0';
const NEWS_API_KEY = '38b231711e97478ea48115ba8025a1e8';

const newsapi = new NewsAPI(NEWS_API_KEY);

// convert data into json format
app.use(express.json());

// Static file
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

//use EJS as the view engine
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '../views'));



app.get("/home", (req, res) => {
    res.render("home");
});
// Register User
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists in the database
        const existingUser = await collection.findOne({ name: username });

        if (existingUser) {
            return res.send('User already exists. Please choose a different username.');
        }

        // Hash the password using bcrypt
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user document
        const newUser = new collection({
            name: username,
            password: hashedPassword
        });

        // Save the new user to the database
        await newUser.save();

        // Redirect to the home page after successful signup
        res.redirect('/home');
    } catch (error) {
        console.error("Error signing up:", error);
        res.send("Error signing up");
    }
});




// Login user 
// Login user 
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            res.send("User name cannot found")
        }
        // Compare the hashed password from the database with the plaintext password
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            res.send("wrong Password");
        } else {
            if (check.isAdmin) {
                res.redirect("/admin"); // Redirect to admin page if user is admin
            } else {
                res.render("home"); // Redirect to main page for non-admin users
            }
        }
    } catch {
        res.send("wrong Details");
    }
});


// Handle weather and news data
app.post('/weather', async (req, res) => {
    let city = req.body.city || "Astana"; // Default to Astana if no city is provided

    try {
        const response = await axios.get(
            `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHERMAP_API_KEY}`
        );

        const weatherData = {
            cityId: response.data.id,
            city: response.data.name,
            temperature: response.data.main.temp,
            feelsLike: response.data.main.feels_like,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon,
            coordinates: response.data.coord,
            humidity: response.data.main.humidity,
            pressure: response.data.main.pressure,
            windSpeed: response.data.wind.speed,
            countryCode: response.data.sys.country,
            rainVolume: response.data.rain ? response.data.rain['1h'] : 0, // Rain volume for the last 3 hours
        };

        const visualCrossingResponse = await axios.get(
            `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?key=${VISUAL_CROSSING_API_KEY}`
        );

        const forecastData = visualCrossingResponse.data;

        const newsResponse = await newsapi.v2.topHeadlines({
            q: city,
            country: 'us',
        });

        const newsData = newsResponse.articles;

        res.render('weather.ejs', { weatherData, forecastData, newsData, error: null });
    } catch (error) {
        console.error(error);
        res.render('weather.ejs', { weatherData: null, forecastData: null, newsData: null, error: 'Error fetching data' });
    }
});

// Default route
app.get("/", (req, res) => {
    res.render("login");
});

// Signup route
app.get("/signup", (req, res) => {
    res.render("signup");
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});

const userId = "65ca3a5b02e5f3d78db64166";

collection.updateOne({ _id: new ObjectId(userId) }, { $set: { isAdmin: true } })
    .then(result => {
        if (result.modifiedCount === 1) {
            console.log("Пользователь успешно обновлен как администратор.");
        } else {
            console.log("Пользователь не найден или уже является администратором.");
        }
    })
    .catch(err => {
        console.error("Произошла ошибка при обновлении пользователя: ", err);
    });



app.get("/admin", async (req, res) => {
    const users = await collection.find(); 
    res.render("admin", { users }); 
});


// Handle GET request for weather endpoint
app.get("/weather", async (req, res) => {
    const city = req.query.city || "Astana"; // Default to Astana if no city is provided

    try {
        const response = await axios.get(
            `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHERMAP_API_KEY}`
        );

        const weatherData = {
            cityId: response.data.id,
            city: response.data.name,
            temperature: response.data.main.temp,
            feelsLike: response.data.main.feels_like,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon,
            coordinates: response.data.coord,
            humidity: response.data.main.humidity,
            pressure: response.data.main.pressure,
            windSpeed: response.data.wind.speed,
            countryCode: response.data.sys.country,
            rainVolume: response.data.rain ? response.data.rain['1h'] : 0, // Rain volume for the last 3 hours
        };

        const visualCrossingResponse = await axios.get(
            `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?key=${VISUAL_CROSSING_API_KEY}`
        );

        const forecastData = visualCrossingResponse.data;

        const newsResponse = await newsapi.v2.topHeadlines({
            q: city,
            country: 'us',
        });

        const newsData = newsResponse.articles;

        res.render('weather.ejs', { weatherData, forecastData, newsData, error: null });
    } catch (error) {
        console.error(error);
        res.render('weather.ejs', { weatherData: null, forecastData: null, newsData: null, error: 'Error fetching data' });
    }
});


// Маршрут для добавления пользователя
app.post("/admin/users/add", async (req, res) => {
    try {
        const { name, password, isAdmin } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

        // Create a new user document
        const newUser = new collection({
            name,
            password: hashedPassword,
            isAdmin: isAdmin === 'true' // Convert isAdmin to a boolean
        });

        // Save the new user to the database
        await newUser.save();

        res.redirect("/admin"); // Redirect back to the admin page after adding the user
    } catch (error) {
        console.error("Error adding user:", error);
        res.send("Error adding user");
    }
});

// Маршрут для редактирования пользователя
app.post("/admin/users/edit", async (req, res) => {
    try {
        const { id, name, password, isAdmin } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

        // Find the user by ID and update their information
        await collection.findByIdAndUpdate(id, {
            name,
            password: hashedPassword,
            isAdmin: isAdmin === 'true' // Convert isAdmin to a boolean
        });

        res.redirect("/admin"); // Redirect back to the admin page after editing the user
    } catch (error) {
        console.error("Error editing user:", error);
        res.send("Error editing user");
    }
});

// Маршрут для удаления пользователя
app.post("/admin/users/delete/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user by ID and delete them
        await collection.findByIdAndDelete(userId);

        res.redirect("/admin"); // Redirect back to the admin page after deleting the user
    } catch (error) {
        console.error("Error deleting user:", error);
        res.send("Error deleting user");
    }
});

