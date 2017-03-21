var express = require("express");
var bodyParser = require("body-parser");

var appPort = (process.env.PORT || 8080);

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("port", appPort);

var routes = require("./routes/routes.js")(app);

var port = app.get("port");
var server = app.listen(port, function () {
    console.log("port is: " + port);
    console.log("Server started listening...");
});
