
// It reads the MongoDB connection URL from environment variables
const mongoose = require("mongoose");

module.exports = function connectToMongo() {
    mongoose.connect(process.env.MONGO_URL)
        .then(() => {
            console.log("MongoDB connection successful");
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err);
        });
};
