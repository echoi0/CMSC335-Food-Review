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

const uri = process.env.MONGO_CONNECTION_STRING;


app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

