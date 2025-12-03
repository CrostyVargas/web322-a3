/*********************************************************************************
* WEB322 – Assignment 03
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy.
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Cristian David Vargas Marin        Student ID: 184658235    Date: 12/2/2025
*
**********************************************************************************/

const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 8080;

// Session Management
const clientSessions = require("client-sessions");

// Database Models
const Task = require("./models/Task"); 
const User = require("./models/User");

// Middelware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Session setup using client-sessions
app.use(clientSessions({
    cookieName: "session",
    secret: process.env.SESSION_SECRET,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
}));

// Middleware to protect routes and ensure the user is logged in
function ensureLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}


// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// // Connect to MongoDB
// const connectToMongo = require("./config/mongoose");
// connectToMongo();

// // Initialize PostgreSQL
// const sequelize = require("./config/postgres");
// const Task = require("./models/Task");
// sequelize.authenticate()
//     .then(() => {
//         console.log("PostgreSQL connection successful");
//         return sequelize.sync();
//     })
//     .then(() => {
//         console.log("PostgreSQL models synchronized");
//     })
//     .catch(err => {
//         console.error("PostgreSQL connection error:", err);
//     });


// *********************** Routes *********************** //

app.get("/", (req, res) => {
    if (req.session.user) {
        return res.redirect("/dashboard");
    }
    res.redirect("/login");
});

app.get("/protected-test", ensureLogin, (req, res) => {
    res.send("You are logged in!");
});

// Registration Handler
app.get("/register", (req, res) => {
    if (req.session.user) return res.redirect("/dashboard");
    res.render("register", { error: null });
});

app.post("/register", async (req, res) => {

    const { username, email, password } = req.body;
    const bcrypt = require("bcryptjs");
    const User = require("./models/User");

    // Basic validation
    if (!username || !email || !password) {
        return res.render("register", { error: "All fields are required." });
    }

    try {
        // Check if username already exists
        let existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render("register", { error: "Username already taken." });
        }

        // Check if email already exists
        existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("register", { error: "Email already registered." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        // Save the user to the database and redirect to login
        await newUser.save();
        res.redirect("/login");
        
    } catch (err) {
        console.log(err);
        res.render("register", { error: "Error creating account. Please try again." });
    }

});

// Login Handler
app.get("/login", (req, res) => {
    if (req.session.user) return res.redirect("/dashboard");
    res.render("login", { error: null });
});

app.post("/login", async (req, res) => {

    const { username, password } = req.body;
    const bcrypt = require("bcryptjs");
    const User = require("./models/User");

    if (!username || !password) {
        return res.render("login", { error: "All fields are required." });
    }

    try {
        // Check if user exists
        const user = await User.findOne({ username });

        if (!user) {
            return res.render("login", { error: "Invalid username or password." });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.render("login", { error: "Invalid username or password." });
        }

        // Create session
        req.session.user = {
            userId: user._id.toString(),
            username: user.username,
            email: user.email
        };

        // Redirect to dashboard
        res.redirect("/dashboard");

    } catch (err) {
        console.log(err);
        res.render("login", { error: "Error logging in. Please try again." });
    }

});

// Dashboard Route
app.get("/dashboard", ensureLogin, async (req, res) => {

    try {
        // Load all tasks for the user
        const tasks = await Task.findAll({
            where: { userId: req.session.user.userId }
        });

        // Calculate quick stats
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === "completed").length;
        const pending = tasks.filter(t => t.status === "pending").length;

        res.render("dashboard", {
            user: req.session.user,
            stats: { total, completed, pending }
        });

    } catch (err) {
        console.log(err);
        res.render("dashboard", {
            user: req.session.user,
            stats: { total: 0, completed: 0, pending: 0 }
        });
    }
});

// Logout Route
app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/login");
});

// Tasks handler
app.get("/tasks", ensureLogin, async (req, res) => {
    try {
        const tasks = await Task.findAll({
            where: { userId: req.session.user.userId }
        });

        res.render("tasks", { tasks });
    } catch (err) {
        console.log(err);
        res.render("tasks", { tasks: [] });
    }
});

// Add Task Handler 
app.get("/tasks/add", ensureLogin, (req, res) => {
    res.render("addTask");
});

app.post("/tasks/add", ensureLogin, async (req, res) => {

    const { title, description, dueDate } = req.body;

    try {
        if (!title.trim()) {
            return res.redirect("/tasks/add");
        }
        await Task.create({
            title,
            description,
            dueDate: dueDate || null,
            status: "pending",
            userId: req.session.user.userId
        });

        res.redirect("/tasks");
    } catch (err) {
        console.log(err);
        res.redirect("/tasks");
    }
});


// Edit Task Handler
app.get("/tasks/edit/:id", ensureLogin, async (req, res) => {

    try {
        const task = await Task.findOne({
            where: { id: req.params.id, userId: req.session.user.userId }
        });

        if (!task) {
            return res.redirect("/tasks");
        }

        res.render("editTask", { task });

    } catch (err) {
        console.log(err);
        res.redirect("/tasks");
    }
});

app.post("/tasks/edit/:id", ensureLogin, async (req, res) => {

    const { title, description, dueDate, status } = req.body;

    try {
        if (!title.trim()) {
            return res.redirect(`/tasks/edit/${req.params.id}`);
        }
        await Task.update(
            { title, description, dueDate, status },
            {
                where: {
                    id: req.params.id,
                    userId: req.session.user.userId
                }
            }
        );

        res.redirect("/tasks");

    } catch (err) {
        console.log(err);
        res.redirect("/tasks");
    }
});

// Delete Task Handler
app.post("/tasks/delete/:id", ensureLogin, async (req, res) => {

    try {
        await Task.destroy({
            where: {
                id: req.params.id,
                userId: req.session.user.userId
            }
        });

    } catch (err) {
        console.log(err);
    }

    res.redirect("/tasks");
});

// Task Status Handler
app.post("/tasks/status/:id", ensureLogin, async (req, res) => {

    try {
        const task = await Task.findOne({
            where: { id: req.params.id, userId: req.session.user.userId }
        });

        if (!task) {
            return res.redirect("/tasks");
        }

        const newStatus = task.status === "pending" ? "completed" : "pending";

        await Task.update(
            { status: newStatus },
            { where: { id: req.params.id } }
        );

        res.redirect("/tasks");

    } catch (err) {
        console.log(err);
        res.redirect("/tasks");
    }
});

//404 Handler
// app.use((req, res) => {
//     res.status(404).send("404 - Page Not Found");
// });



module.exports = app;