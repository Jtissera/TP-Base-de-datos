const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  operationDate: { type: Date, default: Date.now },
  actionType: { type: String, required: true, enum: ['CREATE', 'UPDATE', 'CANCEL'] },
  user: {
    id: { type: Number, required: true },
    email: { type: String, required: true }
  },
  classroom: {
    id: { type: Number, required: true },
    name: { type: String, required: true }
  },
  reservationDetails: {
    reservationId: { type: Number, required: true },
    reservationDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }
});

LogSchema.index({ operationDate: -1 });

LogSchema.index({ 'user.email': 1, operationDate: -1 });
LogSchema.index({ actionType: 1, operationDate: -1 });

module.exports = mongoose.model('Log', LogSchema);