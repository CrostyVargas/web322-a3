// This model defines the Task schema for PostgreSQL using Sequelize

const { DataTypes } = require("sequelize");
const sequelize = require("../config/postgres");

const Task = sequelize.define("Task", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending"
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Task;
