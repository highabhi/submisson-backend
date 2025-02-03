
const mongoose = require('mongoose');

const batchMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true
  }
});

const studentSubmissionSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true,
    enum: ['cs', 'ee', 'me']
  },
  course: {
    type: String,
    required: true,
    enum: ['btech', 'mtech', 'phd']
  },
  rollNumber: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  batchInfo: {
    type: String,
    required: true
  },
  pptFile: {
    filename: String,
    path: String
  },
  ieeeFile: {
    filename: String,
    path: String
  },
  batchMembers: [batchMemberSchema],
  remarks: String,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudentSubmission', studentSubmissionSchema);