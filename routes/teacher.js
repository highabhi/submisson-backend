const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); 

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });

    if (!teacher) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { teacherId: teacher._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, teacher: { email: teacher.email, name: teacher.name } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get teacher profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json(req.teacher);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;