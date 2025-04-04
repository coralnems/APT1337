const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Printer = require('./Printer');

const PrintJob = sequelize.define('PrintJob', {
  stl_file_path: { type: DataTypes.STRING, allowNull: false },
  image_path: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  completed_at: { type: DataTypes.DATE },
});

PrintJob.belongsTo(User);
PrintJob.belongsTo(Printer);
User.hasMany(PrintJob);
Printer.hasMany(PrintJob);

module.exports = PrintJob;