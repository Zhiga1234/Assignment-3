const mongoose = require('mongoose');


// Replace <password> with the password for the ZhigitaliBackend user. Make sure to URL encode any special characters.
const uri = "mongodb+srv://ZhigitaliBackend:Software2202@zhigabackend.eyrfa6q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Successfully connected to MongoDB Atlas!"))
  .catch(error => console.error("Could not connect to MongoDB Atlas:", error));

const Loginschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

const collection = new mongoose.model("login", Loginschema);

module.exports = collection;




