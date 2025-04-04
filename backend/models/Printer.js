const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Printer = sequelize.define('Printer', {
  name: { type: DataTypes.STRING, allowNull: false },
  octoprint_url: { type: DataTypes.STRING, allowNull: false },
  api_key: { type: DataTypes.STRING, allowNull: false },
});

Printer.belongsTo(User);
User.hasMany(Printer);

module.exports = Printer;