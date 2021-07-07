const express = require("express");
const bodyPasrser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// require installed passport modules
const session = require("express-session")
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose")

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyPasrser.urlencoded({ extended: true }));

// set the app to use sessions
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

// initialise passport and use it to manage the sessions
app.use(passport.initialize());
app.use(passport.session());

// setting up database connection
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// set up userSchema to use passportLocalMongoose as a plugin
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("user", userSchema);

// set up passport to creat a local login strategy and serialise and deserialize the user
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
    // if user is already loged in, render secrets page
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.post("/register", (req, res) => {

    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            // authenticate the user; local authentication
            // set up cookie creating a log in sestion
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", (req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
});



app.listen(3000, () => {
    console.log("Server running on port 3000");
})