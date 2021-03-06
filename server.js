"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

//data helpers
const dataHelpers = require("./util/data_helpers")(knex);

// Seperated Routes for each Resource
const usersRoutes = require("./routes/api_users");
const participantsRoutes = require("./routes/api_participants");
const eventsRoutes = require("./routes/api_events");
const eventsHub = require("./routes/eventshub");
const createEvent = require("./routes/create_event");
const eventURL = require("./routes/event_url");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes

//TESTER ROUTES
app.use("/api/users", usersRoutes(dataHelpers));
app.use("/api/participants", participantsRoutes(dataHelpers));
app.use("/api/events", eventsRoutes(dataHelpers));
//////////////////END

//WEBSITE ROUTES
app.use("/eventshub", eventsHub(dataHelpers));
app.use("/eventshub/event", createEvent(dataHelpers));
app.use("/eventshub/event/", eventURL(dataHelpers));


// Home page
app.get("/", (req, res) => {
  res.render("index");
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
