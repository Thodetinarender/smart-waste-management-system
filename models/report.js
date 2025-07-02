const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User'); 

const Report = sequelize.define('Report', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    issueType: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    image: {
        type: Sequelize.STRING,
        allowNull: false
    },
    latitude: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    longitude: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    address: {
        type: Sequelize.STRING,
        allowNull: true
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'Pending'
    },
    inProgressDescription: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    inProgressImage: {
        type: Sequelize.STRING,
        allowNull: true
    },
    resolveDescription: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    resolveImage: {
        type: Sequelize.STRING,
        allowNull: true
    },

    timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'reports'
});

Report.belongsTo(User, { foreignKey: 'userId' });

module.exports = Report;