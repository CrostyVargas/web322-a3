const app = require("../server");

// Vercel Serverless Function entry point
module.exports = (req, res) => {
  app(req, res);
};