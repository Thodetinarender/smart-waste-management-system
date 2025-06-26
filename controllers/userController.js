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

async function getProfile(req, res) {
  try {
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    const user = await UserService.getUserById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
}

async function updateName(req, res) {
  try {
    const userId = req.cookies && req.cookies.userId;
    const { name } = req.body;
    if (!userId || !name) return res.status(400).json({ message: 'Invalid request' });
    await UserService.updateUserName(userId, name);
    res.json({ message: 'Name updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating name' });
  }
}

async function updateAddress(req, res) {
  try {
    const userId = req.cookies && req.cookies.userId;
    const { address } = req.body;
    if (!userId) return res.status(400).json({ message: 'Invalid request' });
    await UserService.updateUserAddress(userId, address);
    res.json({ message: 'Address updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating address' });
  }
}

async function logout(req, res) {
  // Clear cookies (no DB action needed)
  res.clearCookie('loggedIn');
  res.clearCookie('userId');
  res.clearCookie('isAdmin');
  res.status(200).json({ message: 'Logged out' });
}

module.exports = {
  signup,
  login,
  getProfile,
  updateName,
  updateAddress,
  logout
};