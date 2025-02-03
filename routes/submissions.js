const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const StudentSubmission = require('../models/StudentSubmission');
const auth = require('../middleware/auth');

// multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = {
      'pptFile': ['.ppt', '.pptx', '.pdf'],
      'ieeeFile': ['.pdf', '.doc', '.docx']
    };
    
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedFileTypes[file.fieldname]?.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Submit new submission
router.post('/submit', upload.fields([
  { name: 'pptFile', maxCount: 1 },
  { name: 'ieeeFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const submission = new StudentSubmission({
      ...req.body,
      batchMembers: JSON.parse(req.body.batchMembers),
      pptFile: {
        filename: req.files.pptFile[0].originalname,
        path: req.files.pptFile[0].path
      },
      ieeeFile: {
        filename: req.files.ieeeFile[0].originalname,
        path: req.files.ieeeFile[0].path
      }
    });

    await submission.save();
    res.status(201).json({ message: 'Submission successful', id: submission._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all submissions (teachers only)
router.get('/submissions', auth, async (req, res) => {
  try {
    const submissions = await StudentSubmission.find()
      .sort({ submittedAt: -1 });
    
    // Transform file paths to URLs
    const submissionsWithUrls = submissions.map(sub => {
      const submission = sub.toObject();
      submission.pptFile.url = `/uploads/${path.basename(submission.pptFile.path)}`;
      submission.ieeeFile.url = `/uploads/${path.basename(submission.ieeeFile.path)}`;
      return submission;
    });

    res.json(submissionsWithUrls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

module.exports = router;