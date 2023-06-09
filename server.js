const express = require("express");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const logger = require("morgan");
const cors = require("cors");
const app = express();
const http = require("http");
const socketIO = require("socket.io");
const server = http.createServer(app);
const ioOptions = {
  cors: {
    origin: "http://localhost:3000", // Remplacez par l'URL de votre application frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
};

const io = socketIO(server,ioOptions);
const path = require("path");
const promiseMiddleware = require("./middlewares/promise");

app.use(logger("dev"));
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const routes = require("./routes");
const db = require("./models");

app.use(promiseMiddleware());
app.set("appPath", "public");
app.use(express.static(__dirname + "/build"));

app.use(cors()); // Ajoutez ce middleware CORS avant d'initialiser Socket.io

io.on("connection", (socket) => {
  console.log("New client connected");
 io.emit('refresh-page')
  // Lorsque le client se déconnecte
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
const ioModule = require("./ioModule");
ioModule.setIO(io);


app.get("/", function (req, res) {
  res.sendfile(app.get("appPath") + "index.html");
});
app.use("/api", routes);
require("./routes/route")(app);
app.use(function (req, res, next) {
  res.promise(Promise.reject(createError(404)));
});
app.use(function (err, req, res, next) {
  res.promise(Promise.reject(err));
});

const PORT = process.env.PORT || 8100;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
