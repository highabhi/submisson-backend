
const jwt = require('jsonwebtoken');
const Teacher  = require('../models/Teacher')

const auth = async (req, res, next) => { 
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacher = await Teacher.findById(decoded.teacherId);

    if (!teacher) {
      throw new Error();
    }

    req.teacher = teacher;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

module.exports = auth;