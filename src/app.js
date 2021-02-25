const express = require("express");
require("./db/mongoose");

const userRoutes = require("./routes/account");
const mainRoutes = require("./routes/main");
const sellerRoutes = require("./routes/seller");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(__dirname + "../../uploads"));

app.use("/api", mainRoutes);
app.use("/api/accounts", userRoutes);
app.use("/api/seller", sellerRoutes);

module.exports = app;
