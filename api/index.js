// api/index.js

const app = require("../server");

const connectToMongo = require("../config/mongoose"); 
const sequelize = require("../config/postgres");
const Task = require("../models/Task");


let isDbConnected = false;


module.exports = async (req, res) => {
  

  if (!isDbConnected) {
    try {
      console.log("Attempting initial DB connection...");

      connectToMongo(); 

      await sequelize.authenticate();
      await sequelize.sync();
      
      console.log("All databases connected and synchronized successfully.");
      isDbConnected = true;

    } catch (error) {
      console.error("FATAL: Database connection failed during startup:", error.message);

      res.status(500).send("Server initialization failed: Database connection error.");
      return;
    }
  }

  app(req, res);
};