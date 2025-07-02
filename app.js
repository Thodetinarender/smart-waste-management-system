require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./config/db');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoute');
const reportRoutes = require('./routes/reportRoute');
const adminRoutes = require('./routes/adminRoute');


const app = express();
app.use(cookieParser());

// Ensure body-parser middleware is applied
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));


// Public routes (no authentication required)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "views", "html", 'index.html'));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "html", "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "html", "login.html"));
});


app.get('/admin', (req, res) => {
  if (req.cookies && req.cookies.isAdmin === 'true') {
    res.sendFile(path.join(__dirname, "views", "html", "admin.html"));
  } else {
    res.redirect('/');
  }
});

app.use(userRoutes);
app.use(reportRoutes);
app.use(adminRoutes);



sequelize.sync({ force: false }).then(() => { // Avoid using alter: true true
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
});