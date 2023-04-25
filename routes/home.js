// home.js handles all the route coming to home page
const express = require("express");
const router = express.Router();
const { home } = require("../controllers/homeController");

router.route("/").get(home);

module.exports = router;