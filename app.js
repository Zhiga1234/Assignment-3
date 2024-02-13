const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize Express app
const app = express();

// Setup body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

// Setup routes
const weatherRoutes = require('./routes/routes');
app.use('/', weatherRoutes);

// Fallback route for handling 404 (Not Found)
app.use((req, res) => {
    res.status(404).send('404: Page not found');
});

// Set the port the server will listen on
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;