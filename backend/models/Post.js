const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Post = sequelize.define('Post', {
  content: { type: DataTypes.TEXT, allowNull: false },
  image_url: { type: DataTypes.STRING },
  scheduled_at: { type: DataTypes.DATE },
  status: { type: DataTypes.STRING, defaultValue: 'draft' },
});

Post.belongsTo(User);
User.hasMany(Post);

module.exports = Post;