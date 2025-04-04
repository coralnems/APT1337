const express = require('express');
const PrintJob = require('../models/PrintJob');
const router = express.Router();

router.post('/octoprint', async (req, res) => {
  const { event, job } = req.body;
  const printJob = await PrintJob.findOne({ where: { id: job.id } }); // Assumes job.id matches printJob.id
  if (!printJob) return res.sendStatus(404);

  if (event === 'PrintDone') {
    await printJob.update({ status: 'completed', completed_at: new Date() });
  } else if (event === 'PrintFailed') {
    await printJob.update({ status: 'failed' });
  }
  res.sendStatus(200);
});

module.exports = router;