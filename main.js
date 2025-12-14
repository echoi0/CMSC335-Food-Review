"use strict"; 

const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require("mongoose");

require("dotenv").config({
   path: path.resolve(__dirname, "credentials/.env"),
});

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(express.static(path.join(__dirname, 'public')));

async function main() {
   const uri = process.env.MONGO_CONNECTION_STRING;
   const url = 'https://raw.githubusercontent.com/andyklimczak/TheReportOfTheWeek-API/refs/heads/master/data/reports.json';
   let data;

try {
     
   await mongoose.connect(uri);

   const foodSchema = new mongoose.Schema({
      product: String
   });

   const Food = mongoose.model("Food", foodSchema);

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
         console.log(Math.floor(Math.random() * options.length));
      }
      let results = `<table><th>Product</th><th>Manufacturer</th><th>Rating</th><th>Youtube Video Title</th>`;
      let count = 0;
      console.log(itemOne);
      while (count < 4){
            let num = Math.floor(Math.random()* data2.length);
            if(data2[num].category.includes(itemOne)){
            count++;
            await Food.create({
               product: data2[num].product
            });
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
   const filter = {};
   const cursor = await Food.find(filter);
   let answer = "";
   cursor.forEach(item => answer += `<p>${item.product}</p><br>`);
   answer += `<h2>Recent Searches: ${cursor.length} reviews</h2>`; 
   response.render("recent", { search: answer });
});

app.get("/clear", async (request, response) => {
   await Food.deleteMany({});
   response.render("clear");
});

console.log(`Web server started and running at http://localhost:5001`);


console.log("Enter stop to shutdown the server: ");
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

   app.listen(5001);
};

   main();
