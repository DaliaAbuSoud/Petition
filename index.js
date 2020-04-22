const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const db = require("./db.js");
const { hash, compare } = require("./bc.js");
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

// ************************ SignUp/ LogIn ******************************

app.get("/", (req, res) => {
  res.render("signup");
  console.log("Rendering (/) --> to SignUp Page");
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.get("/signup", (req, res) => {
  res.render("signup");
  console.log("Rendering (/) --> to SignUp Page");
});

app.post("/signup-api", (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (firstName !== "" && lastName !== "" && email !== "" && password !== "") {
    db.authorizeLogin(email).then((result) => {
      const foundRows = result.rows;
      if (foundRows.length > 0 && foundRows[0].email === email) {
        res.statusCode = 409;
        res.send({
          message: "This Email is Already Registered, Please Login Instead!",
        });
        res.end();
      } else {
        hash(password)
          .then((hashedPass) => {
            return db.addUserData(firstName, lastName, email, hashedPass);
          })
          .then(() => {
            req.session = null;
            res.redirect("login");
            console.log("Redirecting (/) --> to LogIn Page");
          })
          .catch((err) => {
            console.log("SIGNUP ERROR: ", err);
            res.render("signup", { error: true });
            console.log("Rendering (/) --> to SignUp Page");
          });
      }
    });
  } else {
    res.render("signup");
    console.log("Rendering (/) --> to SignUp Page");
  }
});

app.get("/login", (req, res) => {
  if (!req.session.userID || req.session.userID === null) {
    res.render("login");
  } else {
    res.redirect("petition");
  }
  console.log("Rendering (/) --> to LogIn Page");
});

app.post("/login-api", (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  if (email !== "" && password !== "") {
    let userID;
    db.authorizeLogin(email)
      .then((result) => {
        console.log("TTTTTTTTTTEST");
        if (result.rows.length > 0) {
          let dbPass = result.rows[0].hashedpass;
          console.log("***********DB PASS: ", dbPass);
          userID = result.rows[0].id;
          console.log(userID);
          return dbPass;
        } else {
          res.status(401).send({
            message: "Your Email doesn't exist, please sign up!",
          });
        }
      })
      .then((dbPass) => {
        return compare(password, dbPass.toString("utf8")).then(
          (comparedPass) => {
            return comparedPass;
          }
        );
      })
      .then((comparedPass) => {
        if (comparedPass) {
          req.session.userID = userID;
          res.status(200).redirect("petition");
          console.log("Redirecting (/) --> to Petition Page");
        } else if (!comparedPass) {
          res.status(401).send({
            message: "Your Password is inncorrect",
          });
          console.log("INCORRECT PASSWORD, Rendering (/) --> to LogIn Page");
        }
      })
      .catch((err) => {
        console.log("LOGIN ERROR: ", err);
        res.redirect("login");
      });
  }
});

// ************************ Petition PAGE ******************************

app.get("/petition", (req, res) => {
  const { userID } = req.session;

  if (userID) {
    db.getSingleUser(userID)
      .then((singleUserData) => {
        let sigAvailable;
        const signatureUrl = singleUserData.signatureurl;
        const firstName = singleUserData.firstname;
        const lastName = singleUserData.lastName;

        if (signatureUrl) {
          sigAvailable = true;
        } else {
          sigAvailable = false;
        }

        db.usersCount().then((result) => {
          res.render("petition", {
            sigAvailable,
            signatureUrl,
            usersCount: result,
            firstName,
            lastName,
          });
        });
      })
      .catch((err) => {
        console.log("ERROR: ", err);
      });
  } else {
    res.render("petition");
    console.log("Rendering (/) --> to Petition Page");
  }
});

app.post("/petition-api", (req, res) => {
  const { signatureUrl } = req.body;
  const { userID } = req.session;
  console.log(signatureUrl, userID);
  if (userID !== undefined && signatureUrl !== "") {
    db.setSignature(signatureUrl, userID) //userID: the server creats user Id when users input their data.// id: Key value column for the table rows.
      .then((response) => {
        res.redirect("thanks");
        console.log(response);
      })
      .catch((err) => {
        res.send("Something went wrong! Please try again.");
        console.log("ERROR: ", err);
      });
  } else {
    res.render("petition");
  }
});

// ************************ THANKS PAGE ******************************

app.get("/thanks", (req, res) => {
  const { userID } = req.session;
  if (userID) {
    db.getSignature(userID)
      .then((signatureUrl) => {
        db.usersCount().then((result) => {
          res.render("thanks", {
            signatureUrl: signatureUrl,
            usersCount: result,
          });
        });
      })
      .catch((err) => {
        console.log("ERROR: ", err);
      });
  } else {
    res.redirect("petition");
  }
});

// ************************ SIGNERS PAGE ******************************

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
  }
});

// ************************ ByCity PAGE ******************************

app.get("/bycity/:cityName", (req, res) => {
  const { userID } = req.session;

  if (userID) {
    db.getCityUsersData(req.params.cityName)
      .then((response) => {
        console.log("***********RESPONSE CITY", response);
        res.render("bycity", {
          signersData: response,
        });
        console.log("*******RESPONSE: ".signersData);
      })
      .catch((error) => {
        console.log("ERROR: ", error);
      });
  }
});

// ************************ ByCountry PAGE ******************************

app.get("/bycountry/:countryName", (req, res) => {
  const { userID } = req.session;

  if (userID) {
    db.getCountriesUsersData(req.params.countryName)
      .then((response) => {
        console.log("***********RESPONSE COUNTRY", response);
        res.render("bycountry", {
          signersData: response,
        });
      })
      .catch((error) => {
        console.log("ERROR: ", error);
      });
  }
});

// ************************ User Profile PAGE ******************************

app.get("/userprofile", (req, res) => {
  db.getSingleUser(req.session.userID)
    .then((userData) => {
      const userInfo = {
        firstName: userData.firstname,
        lastName: userData.lastname,
        city: userData.city,
        country: userData.country,
        age: userData.age,
      };

      console.log("USERDATA", userData);
      res.render("userprofile", userInfo);
    })
    .catch((err) => {
      console.log("ERROR: ", err);
    });
});

app.post("/userprofile", (req, res) => {
  const { firstName, lastName, password, city, country, age } = req.body;

  if (city !== "" && country !== "" && age !== "") {
    hash(password)
      .then((hashedPass) => {
        const dataToStore = {
          firstName,
          lastName,
          hashedPass,
          city,
          country,
          age,
        };
        db.updateUserData(dataToStore, req.session.userID)
          .then(() => {
            res.status(200).send({
              message: "Profile has been updated successfully",
            });
            console.log("Rendering (userprofile) --> to userprofile Page");
          })
          .catch((err) => {
            res.status(404).send({
              message: "something went wrong",
            });
            console.log(
              err,
              "Adding User Profile Data Error/  Rendering (userprofile)--> to SignUp Page"
            );
          });
      })
      .catch((error) => {
        console.log("Update user profile failed", error);
      });
  } else {
    res.render("userprofile");
    console.log(
      "Empty User Data/ Rendering(userprofile)--> to UserProfile Page to fill again"
    );
  }
});

// ************************ UN_SIGN PAGE ******************************

app.get("/unsign", (req, res) => {
  const { userID } = req.session;
  if (userID) {
    db.getSignature(userID)
      .then((signatureUrl) => {
        res.render("unsign", {
          signatureUrl: signatureUrl,
        });
      })
      .catch((err) => {
        console.log("ERROR: ", err);
      });
  } else {
    res.redirect("signup");
  }
});

app.post("/unsign", (req, res) => {
  const { userID } = req.session;
  const { signatureUrl } = req.body;

  if (userID) {
    db.removeSig(signatureUrl, req.session.userID)
      .then(() => {
        res.status(200).send({
          message: "Signature Removed",
        });
      })
      .catch((error) => {
        res.status(404).send({
          message: "Failed",
        });
        console.log("REMOVE SIG ERROR:", error);
      });
  }
});

// ***************************************************************************
app.listen(process.env.PORT || 8080, () =>
  console.log("**************Server is Listening**************")
);
