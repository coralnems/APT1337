const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Post = require('./Post');
const SocialMediaAccount = require('./SocialMediaAccount');

const PostDestination = sequelize.define('PostDestination', {
  status: { type: DataTypes.STRING, defaultValue: 'scheduled' },
});

PostDestination.belongsTo(Post);
PostDestination.belongsTo(SocialMediaAccount);
Post.hasMany(PostDestination);
SocialMediaAccount.hasMany(PostDestination);

module.exports = PostDestination;