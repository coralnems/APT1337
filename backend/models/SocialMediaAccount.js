const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const SocialMediaAccount = sequelize.define('SocialMediaAccount', {
  platform: { type: DataTypes.STRING, allowNull: false },
  access_token: { type: DataTypes.TEXT, allowNull: false },
  refresh_token: { type: DataTypes.TEXT },
  expires_at: { type: DataTypes.DATE },
});

SocialMediaAccount.belongsTo(User);
User.hasMany(SocialMediaAccount);

module.exports = SocialMediaAccount;