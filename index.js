const express = require("express");

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

myConnection.query(
  "CREATE TABLE users(userid INT NOT NULL AUTO_INCREMENT, email VARCHAR(100), fullname VARCHAR(200), password VARCHAR(255), phone VARCHAR(20), PRIMARY KEY(userid))",
  (sqlerror) => {
    if (sqlerror) {
      console.log(sqlerror.message);
    } else {
      console.log("table created");
    }
  }
);

const app = express();
app.use(express.static("public"));

app.get("/", (req, res) => {
  console.log(req.baseUrl);
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
  res.render("login.ejs");
});

app.get("/signup", (req, res) => {
  //RECEIVE DATA
  // INPUT VALIDATION
  // HASH THE PASSWORD
  // SAVE DATA IN DB
  console.log(req.path);
  res.render("signup.ejs");
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
