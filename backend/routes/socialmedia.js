const express = require('express');
const axios = require('axios');
const Post = require('../models/Post');
const PostDestination = require('../models/PostDestination');
const SocialMediaAccount = require('../models/SocialMediaAccount');
const router = express.Router();
const authenticate = require('../middleware/auth');
const postQueue = require('../queues/postQueue');

router.get('/facebook/auth', (req, res) => {
  const redirectUri = 'http://localhost:5000/api/socialmedia/facebook/callback';
  const url = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=pages_manage_posts`;
  res.redirect(url);
});

router.get('/facebook/callback', authenticate, async (req, res) => {
  const { code } = req.query;
  const redirectUri = 'http://localhost:5000/api/socialmedia/facebook/callback';
  try {
    const { data } = await axios.get(`https://graph.facebook.com/v12.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}&redirect_uri=${redirectUri}`);
    await SocialMediaAccount.create({
      platform: 'facebook',
      access_token: data.access_token,
      UserId: req.user.id,
    });
    res.redirect('http://localhost:3000/posts'); // Redirect to frontend
  } catch (error) {
    res.status(500).json({ error: 'Facebook authentication failed' });
  }
});

router.post('/posts', authenticate, async (req, res) => {
  const { content, image_url, scheduled_at, platforms } = req.body;
  try {
    const post = await Post.create({
      content,
      image_url,
      scheduled_at,
      status: 'scheduled',
      UserId: req.user.id,
    });

    for (const platform of platforms) {
      const account = await SocialMediaAccount.findOne({ where: { UserId: req.user.id, platform } });
      if (account) {
        const destination = await PostDestination.create({
          PostId: post.id,
          SocialMediaAccountId: account.id,
        });
        postQueue.add({ postId: post.id, platform, accountId: account.id }, { delay: new Date(scheduled_at) - new Date() });
      }
    }
    res.status(201).json({ id: post.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

module.exports = router;