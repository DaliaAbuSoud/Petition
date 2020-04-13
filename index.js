const express = require("express");
const handlebars = require("express-handlebars");
const app = express();
const db = require("./db.js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const hbs = handlebars.create({
    helpers: {
        dateFormat: require("handlebars-dateformat"),
    },
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.use(express.static("./public"));
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/petition", (req, res) => {
    res.render("home");
});

app.post("/petition", (req, res) => {
    const { firstName, lastName, city, country, signatureUrl } = req.body;
    res.cookie("authenticated", true);
    db.addUserData(firstName, lastName, city, country, signatureUrl)
        .then((response) => {
            console.log(response);
            res.statusCode = 200;
            res.redirect("/thanks");
        })
        .catch((err) => {
            res.statusCode = 400;
            res.send("Something went wrong! Please try again.");
        });
});

app.get("/thanks", (req, res) => {
    if (!req.cookies.authenticated) {
        res.redirect("/petition");
    } else {
        db.getUserData()
            .then((response) => {
                res.render("thanks", {
                    signersCount: response.rowCount,
                });
            })
            .catch((err) => {
                res.statusCode = 403;
                res.send("Unauthorize Request!");
            });
    }
});

app.get("/signers", (req, res) => {
    if (!req.cookies.authenticated) {
        res.redirect("/petition");
    } else {
        db.getUserData()
            .then((response) => {
                res.render("signers", {
                    signersData: response.rows,
                });
            })
            .catch((err) => {
                res.statusCode = 403;
                res.send("Unauthorize Request!");
            });
    }
});

app.listen(8080, () => console.log("Petention Server is Listening"));
