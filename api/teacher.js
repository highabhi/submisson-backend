const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Add input validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

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

        res.json({ 
            token, 
            teacher: { 
                id: teacher._id,
                email: teacher.email, 
                name: teacher.name,
                department: teacher.department 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/profile', auth, async (req, res) => {
    try {
        // Exclude password from the response
        const teacher = req.teacher.toObject();
        delete teacher.password;
        res.json(teacher);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/register', async (req, res) => {
  try {
      const { name, email, password, department } = req.body;
      
      console.log('Registration attempt:', { name, email, department }); // Log registration data (don't log password)
      
      // Add input validation
      if (!name || !email || !password) {
          return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      // Check if email already exists
      const existingTeacher = await Teacher.findOne({ email });
      if (existingTeacher) {
          return res.status(400).json({ error: 'Email already in use' });
      }

      // Create new teacher
      const newTeacher = new Teacher({ name, email, password, department });
      await newTeacher.save();

      res.status(201).json({ 
          message: 'Teacher registered successfully', 
          teacherId: newTeacher._id 
      });
  } catch (error) {
      console.error('Detailed registration error:', error); // More detailed error logging
      res.status(500).json({ error: 'Server error: ' + error.message }); // Send back the error message
  }
});

module.exports = router;