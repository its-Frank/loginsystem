const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mysql = require("mysql");
const myConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "login system",
});

//test the db connection
myConnection.connect((err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("database connected successfully");
  }
});
// myConnection.query("DROP TABLE users");
myConnection.query(
  "CREATE TABLE users(userid INT NOT NULL AUTO_INCREMENT, email VARCHAR(100), fullname VARCHAR(200), password VARCHAR(255), phone VARCHAR(20),dob DATE, PRIMARY KEY(userid))",
  (sqlerror) => {
    if (sqlerror) {
      console.log(sqlerror.message);
    } else {
      console.log("table created");
    }
  }
);

const app = express();
// use method is used to run middleware functions - these are functions that run in every request
app.use((req, res, next) => {
  console.log("This is a middleware function!!! runs on every request");
  next();
});
// middleware can be used for authentication i.e make sure that requests being received are from logged in users, since http is stateless
// Http is stateless implies that every request-response cycle is completely independent, even if they are from the same device.
app.use(express.urlencoded({ extended: false })); // body parser -- converts the body of the incoming request into a javascript object

app.use(express.static("public")); // tell express to look for static files(css,)

app.use(
  session({
    secret: "hgdydg",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
  })
);

app.use(cookieParser());
app.use((req, res, next) => {
  const protectedRoutes = [
    "/protectedRouteOne",
    "/protectedRouteTwo",
    "/profile",
  ];
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
    next();
  } else if (protectedRoutes.includes(req.path)) {
    res.status().send("Login to access this resource");
  } else {
    //public route ---, signup, landing, login
    next();
  }
});

app.get("/", (req, res) => {
  console.log(req.baseUrl);
  console.log(req.cookies);
  res.render("index.ejs");
});

app.get("/login", (req, res) => {
  // RECEIVE DATA form client/frontend
  // COMPARE CRED WITH WHAT IS IN DB
  // IF PASS/ MATCH-- CREATE A SESSION
  // assignment What are Sessions and Why we need sessions in a web server
  // What does it mean to say HTTP IS STATELESS
  // UUID
  //PARAMS
  // PARSE
  if (req.query.signupSuccess) {
    res.render("login.ejs", {
      message: "Signup successful!! You can now login",
    });
  } else {
    res.render("login.ejs");
  }
});

app.post("/login", (req, res) => {
  // RECEIVE DATA form client/frontend
  // COMPARE CRED WITH WHAT IS IN DB
  // IF PASS/ MATCH-- CREATE A SESSION
  console.log(req.body);
  const loginStatement = `SELECT email, fullname, password FROM users WHERE email = '${req.body.email}'`;
  myConnection.query(loginStatement, (sqlErr, userData) => {
    if (sqlErr) {
      res.status(500).render("login.ejs", {
        message: "server Error, Contact Admin if this persists!",
      });
    } else {
      if (userData.length == 0) {
        res
          .status(401)
          .render("login.ejs", { message: "Email or Password Invalid 1" });
      } else {
        if (bcrypt.compareSync(req.body.pass, userData[0].password)) {
          // create a session
          req.session.user = userData[0];
          res.redirect("/");
        } else {
          res
            .status(401)
            .render("login.ejs", { message: "Email or Password Invalid 2" });
        }
      }
    }
  });
});

app.get("/signup", (req, res) => {
  //RECEIVE DATA form client/frontend
  // INPUT VALIDATION -- compare password with confirm password, email validation, --sql injection
  // HASH THE PASSWORD
  // SAVE DATA IN DB
  // encryption methods/ algorithms
  console.log(req.path);
  res.render("signup.ejs");
});

app.post("/signup", (req, res) => {
  console.log(req.body);
  if (req.body.password === req.body.confirm_pass) {
    let sqlStatement = ` INSERT INTO users (email, fullname, password, phone, dob) VALUES("${
      req.body.email
    }", "${req.body.fullname}", "${bcrypt.hashSync(req.body.password, 5)}", "${
      req.body.phone
    }", "${req.body.dob}")`;
    myConnection.query(sqlStatement, (sqlErr) => {
      if (sqlErr) {
        res.status(500).render("signup.ejs", {
          error: true,
          errMessage: "Server Error: Contact Admin if this persists.",
          prevInput: req.body,
        });
      } else {
        res.status(304).redirect("/login?signupSuccess=true");
      }
    });
  } else {
    res.render("signup.ejs", {
      error: true,
      errMessage: "password and confirm password do not match!",
      prevInput: req.body,
    });
  }
});

app.get("/protectRouteOne", (req, res) => {
  res.send("Only for logged users!");
});

app.get("/protectRouteTwo", (req, res) => {
  res.send("Only for logged in users!");
});

app.get("/publicRouteOne", (req, res) => {
  res.send("for any visitors");
});

app.get("*", (req, res) => {
  res.status(404).send("Page Not Found");
});

app.listen(5000, () => console.log("Server running on port 5000"));
