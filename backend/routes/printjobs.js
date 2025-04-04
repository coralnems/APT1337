const express = require('express');
const axios = require('axios');
const multer = require('multer');
const PrintJob = require('../models/PrintJob');
const Printer = require('../models/Printer');
const router = express.Router();
const authenticate = require('../middleware/auth');
const upload = multer({ dest: 'uploads/' });

router.post('/', authenticate, upload.fields([{ name: 'stl' }, { name: 'image' }]), async (req, res) => {
  const { printer_id } = req.body;
  const stl = req.files.stl[0];
  const image = req.files.image[0];

  try {
    const printJob = await PrintJob.create({
      stl_file_path: stl.path,
      image_path: image.path,
      status: 'pending',
      UserId: req.user.id,
      PrinterId: printer_id,
    });

    const printer = await Printer.findByPk(printer_id);
    const formData = new FormData();
    formData.append('file', require('fs').createReadStream(stl.path));
    formData.append('print', 'true');

    await axios.post(`${printer.octoprint_url}/api/files/local`, formData, {
      headers: {
        'X-Api-Key': printer.api_key,
        'Content-Type': 'multipart/form-data',
      },
    });

    await printJob.update({ status: 'printing' });
    res.status(201).json({ id: printJob.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create print job' });
  }
});

router.get('/', authenticate, async (req, res) => {
  const printJobs = await PrintJob.findAll({ where: { UserId: req.user.id } });
  res.json(printJobs);
});

module.exports = router;