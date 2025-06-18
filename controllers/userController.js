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
    res.cookie('loggedIn', 'true', { httpOnly: false });
    res.cookie('userId', user.id, { httpOnly: false });
    res.cookie('isAdmin', user.isAdmin ? 'true' : 'false', { httpOnly: false });
    if (user.isAdmin) {
      res.redirect('/admin');
    } else {
      res.redirect('/');
    }
  } catch (err) {
    res.status(500).send('Error logging in.');
  }
}

module.exports = {
  signup,
  login
};