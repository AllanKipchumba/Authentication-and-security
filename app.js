//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyPasrser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyPasrser.urlencoded({ extended: true }));

// setting up database connection
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// grab the secret from the environment variable
const secret = process.env.SECRET;

userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

const User = new mongoose.model("user", userSchema);

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save((err) => {
        if (!err) {
            res.render("secrets");
        } else {
            console.log(err);
        }
    });
});

app.post("/login", (req, res) => {

    const userName = req.body.username;
    const password = req.body.password;

    User.findOne({ email: userName }, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    // console.log(foundUser.password);
                    res.render("secrets");
                }
            }
        }
    });
});




app.listen(3000, () => {
    console.log("Server running on port 3000");
})