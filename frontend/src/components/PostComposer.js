import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Checkbox, FormControlLabel } from '@mui/material';

function PostComposer({ token }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/socialmedia/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setAccounts(res.data));
  }, [token]);

  const connectFacebook = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/socialmedia/facebook/auth`;
  };

  const handleSubmit = async () => {
    await axios.post(`${process.env.REACT_APP_API_URL}/socialmedia/posts`, {
      content,
      image_url: imageUrl,
      scheduled_at: scheduledAt,
      platforms,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <div>
      <Button onClick={connectFacebook}>Connect Facebook</Button>
      <TextField label="Content" value={content} onChange={(e) => setContent(e.target.value)} />
      <TextField label="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <TextField type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
      {accounts.map(acc => (
        <FormControlLabel
          key={acc.id}
          control={<Checkbox checked={platforms.includes(acc.platform)} onChange={() => setPlatforms(p => p.includes(acc.platform) ? p.filter(x => x !== acc.platform) : [...p, acc.platform])} />}
          label={acc.platform}
        />
      ))}
      <Button onClick={handleSubmit}>Schedule Post</Button>
    </div>
  );
}

export default PostComposer;