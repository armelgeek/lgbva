const express = require("express");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const logger = require("morgan");
const cors = require("cors");
const app = express();

const path = require('path');
const promiseMiddleware = require("./middlewares/promise");

const allowedOrigins = "http://localhost:8100/";
app.use(logger("dev"));
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const routes = require("./routes");
const db = require("./models");

app.use(promiseMiddleware());
app.use(express.static('build'));
app.get('/',function(req, res) {
    res.sendfile('build/index.html');
  });
app.use("/api", routes);
require('./routes/route')(app);
app.use(function (req, res, next) {
  res.promise(Promise.reject(createError(404)));
});
app.use(function (err, req, res, next) {
  res.promise(Promise.reject(err));
});
const PORT = process.env.PORT || 8100;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
