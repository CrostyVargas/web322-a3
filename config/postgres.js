// This module initializes the PostgreSQL connection using Sequelize

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
    dialect: "postgres",
    dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
    }
});

module.exports = sequelize;
