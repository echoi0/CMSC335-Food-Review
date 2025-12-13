"use strict";

const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

require("dotenv").config({
   path: path.resolve(__dirname, "credentials/.env"),
});
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, {serverApi: ServerApiVersion.v1});

const databaseName = "FOOD";
const collectionName = "foodReview";


app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(express.static(path.join(__dirname, 'public')));

const url = 'https://raw.githubusercontent.com/andyklimczak/TheReportOfTheWeek-API/refs/heads/master/data/reports.json';
const data = {};

app.get("/", async (request, response) => {
   try {
      const APIresponse = await fetch(url);
      if (!APIresponse.ok) {
         throw new Error('Network response was not ok: ' + response.statusText)
      }
      data = await APIresponse.json();
        
      response.render("index", { data });
   } catch (error) {
      console.error(error);
      response.render("index", { data: null, error: "Could not fetch data" });
   }
});

app.post("/search", async (request, response) => {
   const database = client.db(databaseName);
   const collection = database.collection(collectionName);
   const selectedReviews = request.body.reviews;
   const username = request.body.name || "Guest";
   const user = { name: username };
   await collection.insertOne(user);
});

console.log(`Web server started and running at http://localhost:5000`);


console.log("Stop to shutdown the server: ");
process.stdin.on("data", (data) => {
    const input = data.toString().trim();
    if (input === "stop") {
        console.log("Shutting down the server");
        process.exit(0);
    } else {
        console.log(`Invalid command: ${input}`);
    }
});



app.listen(5000);
