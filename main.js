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

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(express.static(path.join(__dirname, 'public')));

async function main() {
   const uri = process.env.MONGO_CONNECTION_STRING;
   const databaseName = "FOOD";
   const collectionName = "foodReview";
   const url = 'https://raw.githubusercontent.com/andyklimczak/TheReportOfTheWeek-API/refs/heads/master/data/reports.json';
   let data;

try {
      const client = new MongoClient(uri, {serverApi: ServerApiVersion.v1});
      await client.connect();
      const database = client.db(databaseName);
      const collection = database.collection(collectionName);

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

app.get("/search", async (request, response) => {
   const itemsSelected = request.query.reviews;
      try {
      const APIresponse = await fetch(url);
      if (!APIresponse.ok) {
         throw new Error('Network response was not ok: ' + response.statusText)
      }
      const dataA = await APIresponse.json();
      let data2 = dataA.reports;
      let itemOne = "";
      if(itemsSelected === "Energy"){
         itemOne = "Energy Crisis";
      }else if (itemsSelected === "Drink"){
         itemOne = "Drink Review";
      }else if (itemsSelected === "Food"){
         itemOne = "Running On Empty";
      }else if (itemsSelected === "Surprise"){
         const options = ["Running on Empty", "Energy Crisis", "Drink Review"];
         itemOne = options[Math.floor(Math.random() * options.length)];
      }
      let results = `<table><th>Product</th><th>Manufacturer</th><th>Rating</th><th>Youtube Video Title</th>`;
      let count = 0;
      while (count < 4){
            let num = Math.floor(Math.random()* data2.length);
            if(data2[num].category.includes(itemOne)){
            count++;
            await collection.insertOne({ product: data2[num].product });
            results += 
            `
                  <tr>
                  <td>${data2[num].product}</td>
                  <td>${data2[num].manufacturer}</td>
                  <td>${data2[num].rating || "No Rating"}</td>
                  <td>${data2[num].videoTitle}</td>
                  </tr>
            `;
            }
      }
      results += "</table>";
      
      response.render("search", {table : results});
      } catch (error) {
      console.error(error);
      //response.render("index", { data: null, error: "Could not fetch data" });
      }

   // const database = client.db(databaseName);
   // const collection = database.collection(collectionName);
   // const selectedReviews = request.body.reviews;
   // const username = request.body.name || "Guest";
   // const user = { name: username };
   // await collection.insertOne(user);
});


app.get("/recent", async (request, response) => {
   //const database = client.db(databaseName);
   //const collection = database.collection(collectionName);
   const filter = {};
   const cursor = collection.find(filter);
   const result = await cursor.toArray();
   let answer = "";
   result.forEach(item => answer += `<p>${item.product}</p><br>`);
   answer += `<h2>Recent Searches: ${result.length} reviews</h2>`; 
   response.render("recent", { search: answer });
});

app.get("/clear", async (request, response) => {
   await client.connect();
   const database = client.db(databaseName);
   const collection = database.collection(collectionName);
   await collection.deleteMany({});
   response.render("clear");
});

console.log(`Web server started and running at http://localhost:6543`);


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

} catch (e) {
      console.error(e);
    } 

app.listen(6543);
   };

   main();
