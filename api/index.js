// api/index.js


const app = require("../server");
const connectToMongo = require("../config/mongoose"); 
const sequelize = require("../config/postgres");

let isDbConnecting = false;

module.exports = async (req, res) => {
  if (!isDbConnecting) {
    isDbConnecting = true;
    try {

      console.log("Attempting DB connections...");
      
      connectToMongo(); 

      await sequelize.authenticate();

      await sequelize.sync(); 
      
      console.log("DB connections are ready.");
    } catch (error) {
      console.error("FATAL: Database check failed:", error.message);

      isDbConnecting = false; 
      res.status(500).send("Server error: Database initialization failed.");
      return;
    }

  }

  app(req, res);
};