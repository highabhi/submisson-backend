const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const teacher = await Teacher.findById(decoded.teacherId);

            if (!teacher) {
                return res.status(404).json({ error: 'Teacher not found' });
            }

            req.teacher = teacher;
            next();
        } catch (jwtError) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = auth;