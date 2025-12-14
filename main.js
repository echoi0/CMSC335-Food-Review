"use strict"; 

const fs = require('fs');
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
      // const client = new MongoClient(uri, {serverApi: ServerApiVersion.v1});
      // await client.connect();
      // const database = client.db(databaseName);
      // const collection = database.collection(collectionName);

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


app.post("/search", async (request, response) => {
   
   const itemsSelected = request.body.reviews;
      try {
      const APIresponse = await fetch(url);
      if (!APIresponse.ok) {
         throw new Error('Network response was not ok: ' + response.statusText)
      }
      const dataA = await APIresponse.json();
      let data2 = dataA.reports;
      let itemOne = "Review";
      if (itemsSelected === "Food"){
         itemOne = "Food Review"
      }else if(itemsSelected === "Drinks"){
         itemOne = "Drink Review" //only drink
      }
      let results = ``;
      let count = 0;
      while (count < 4){
                  let num = Math.floor(Math.random()* data2.length);
                    if(data2[num].videoTitle.includes(itemOne)){
                     count++;
                     //await collection.insertOne(data2[num].product);
                     await Food.create({
                        product : data2[num].product
                     });
                    results += `
                        <p>Product: ${data2[num].product}</p>
                        <p>Rating: ${data2[num].rating}</p>
                        <p>Rating: ${data2[num].videoTitle}</p>
                        <hr>
                    `;}
                //});
               }

               const variables = {result : results };
               
                 response.render("search", variables);
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

app.get("/recentSearches", async (request, response) => {
   const filter = {};
   // const cursor = collection.find(filter);
   const cursor = await Food.find(filter);
   let answer = "";
      cursor.forEach(item => answer += `${item.product}<br>`);
      answer += `Recent Searches: ${cursor.length} reviews`; 
      let hi = {search: answer};
      response.render("recentSearch", hi);
});

app.get("/clearSearches", async (request, response) => {
      await Food.deleteMany({});
      response.render("clear");
});

// app.post("/recent", async (request, response) => {
//    //const database = client.db(databaseName);
//    //const collection = database.collection(collectionName);
//    const filter = {};
//    const cursor = collection.find(filter);
//    const cursor = await Food.find(filter);
//    const result = await cursor.toArray();
//    let answer = "";
//       result.forEach(item => answer += `${item}<br>`);
//       answer += `Recent Searches: ${result.length} reviews`; 
//       response.send(answer);
// });

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
