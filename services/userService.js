const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createUser({ name, email, mobile, address, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({
    name,
    email,
    mobile,
    address,
    password: hashedPassword
  });
}


async function authenticateUser(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user) return null;
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;
  return user;
}

module.exports = {
  createUser,
  authenticateUser
};