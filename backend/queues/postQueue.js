const Queue = require('bull');
const axios = require('axios');
const Post = require('../models/Post');
const SocialMediaAccount = require('../models/SocialMediaAccount');
const PostDestination = require('../models/PostDestination');
require('dotenv').config();

const postQueue = new Queue('socialMediaPosts', process.env.REDIS_URL);

postQueue.process(async (job) => {
  const { postId, platform, accountId } = job.data;
  const post = await Post.findByPk(postId);
  const account = await SocialMediaAccount.findByPk(accountId);

  if (platform === 'facebook') {
    await axios.post('https://graph.facebook.com/v12.0/me/feed', {
      message: post.content,
      access_token: account.access_token,
    });
  }

  await PostDestination.update(
    { status: 'posted' },
    { where: { PostId: postId, SocialMediaAccountId: accountId } }
  );
});

module.exports = postQueue;