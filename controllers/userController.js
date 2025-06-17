const UserService = require('../services/userService');

async function signup(req, res) {
  try {
    const { name, email, mobile, address, password } = req.body;
    await UserService.createUser({ name, email, mobile, address, password });
    res.redirect('/login');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send('Email already exists.');
    }
    res.status(500).send('Error creating user.');
  }
}


async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await UserService.authenticateUser(email, password);
    if (!user) {
      return res.status(401).send('Invalid email or password.');
    }
    // You can set a session or JWT here if needed
    res.redirect('/index');
  } catch (err) {
    res.status(500).send('Error logging in.');
  }
}

module.exports = {
  signup,
  login
};