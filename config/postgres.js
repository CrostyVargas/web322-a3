// This module initializes the PostgreSQL connection using Sequelize

const { Sequelize } = require("sequelize");

let sequelize = null;

function getSequelize() {
    if (!sequelize) {
        sequelize = new Sequelize(process.env.POSTGRES_URL, {
            dialect: "postgres",
            dialectModule: require("pg"),
            logging: false,
        });
    }
    return sequelize;
}

module.exports = getSequelize();
