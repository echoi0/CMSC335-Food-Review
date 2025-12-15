const express = require('express');
const router = express.Router();

router.get("/", (request, response) => {
    response.render("aboutpage");
});

router.get("/app", (request, response) => {
    response.render("app");
});

router.get("/team", (request, response) => {
    response.render("team");
});

router.use((request, response) => {
    response.status(404).send("ROUTE NOT FOUND!");
});

module.exports = router;