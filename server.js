"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var vite_express_1 = require("vite-express");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var env = process.env.NODE_ENV;
console.log("Environment:", env);
var app = (0, express_1.default)();
vite_express_1.default.config({ mode: env });
// app.get("/message", (_, res) => res.send("Hello from express!"));
vite_express_1.default.listen(app, 3000, function () {
  return console.log("Server is listening...");
});
