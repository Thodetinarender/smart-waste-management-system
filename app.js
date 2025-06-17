require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./config/db');
const userRoutes = require('./routes/userRoute');

const app = express();

// Ensure body-parser middleware is applied
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use('/public', express.static(path.join(__dirname, 'public')));

// Public routes (no authentication required)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "views", "html", 'signup.html'));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "html", "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "html", "login.html"));
});


app.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "html", "index.html"));
});
app.use(userRoutes);


sequelize.sync({ force: false }).then(() => { // Avoid using alter: true true
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});