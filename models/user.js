const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const user = sequelize.define('User', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  mobile: {
    type: Sequelize.STRING,
    allowNull: false
  },
  address: {
    type: Sequelize.STRING,
    allowNull: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
    },
}, 
{
  tableName: 'users'
});

module.exports = user;