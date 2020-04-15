const express = require("express");
const handlebars = require("express-handlebars");
const app = express();
const db = require("./db.js");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const hbs = handlebars.create({
    helpers: {
        dateFormat: require("handlebars-dateformat"),
    },
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

//************** Set MiddleWare *************************
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    cookieSession({
        secret: "Dalia's Petition",
        maxAge: 1000 * 60 * 60 * 14 * 14, //cookies set for 2 weeks
    })
);
// app.use(csurf());
// app.use((req, res, next) => {
//     res.set("X-Frame-Options", "deny");
//     res.locals.csrfToken = req.csrfToken();
//     next();
// });

app.use(express.static("./public"));
app.use(bodyParser.json());

// ******************************************************
app.get("/", (req, res) => {
    res.redirect("/petition");
    console.log("Redirected to /petition");
});

app.get("/petition", (req, res) => {
    const { id } = req.session;
    if (id) {
        res.redirect("/thanks");
    } else {
        res.render("home");
    }
});

app.post("/petition", (req, res) => {
    const { firstName, lastName, city, country, signatureUrl } = req.body;
    if (req.body) {
        db.addUserData(firstName, lastName, city, country, signatureUrl)
            .then((response) => {
                console.log(response);
                let id = response.rows[0].id;
                req.session.userID = id;
                // req.session.signatureUrl = id;
                res.redirect("/thanks");
            })
            .catch((err) => {
                res.send("Something went wrong! Please try again.");
                console.log("ERROR: ", err);
            });
    } else {
        res.render("home");
    }
});

app.get("/thanks", (req, res) => {
    const { userID } = req.session;
    console.log("userID:", userID);
    if (userID) {
        db.getSignature(userID)
            .then((response) => {
                res.render("thanks", {
                    signatureUrl: response,
                });
            })
            .catch((err) => {
                console.log("ERROR: ", err);
            });
    } else {
        res.redirect("/petition");
    }
});

app.get("/signers", (req, res) => {
    const { userID } = req.session;

    if (userID) {
        db.getUserData()
            .then((response) => {
                res.render("signers", {
                    signersData: response.rows,
                });
            })
            .catch((err) => {
                console.log("ERROR :", err);
            });
    } else {
        res.redirect("/petition");
    }
});

app.listen(8080, () => console.log("Petention Server is Listening"));
