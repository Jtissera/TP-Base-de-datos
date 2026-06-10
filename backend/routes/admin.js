const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const protectByRole = require('../middleware/auth');


router.get('/admin/logs', protectByRole(['administrator']), async (req, res) => {
  const { actionType, userEmail, classroomName, startDate, endDate } = req.query;

  const mongoQuery = {};

  if (actionType) {
    mongoQuery.actionType = actionType;
  }

  if (userEmail) {
    mongoQuery['user.email'] = { $regex: userEmail, $options: 'i' };
  }

  if (classroomName) {
    mongoQuery['classroom.name'] = { $regex: classroomName, $options: 'i' };
  }

  if (startDate || endDate) {
    mongoQuery.operationDate = {};
    
    if (startDate) {
      mongoQuery.operationDate.$gte = new Date(startDate); 
    }
    
    if (endDate) {
      const targetEndDate = new Date(endDate);
      if (endDate.length === 10) {
        targetEndDate.setHours(23, 59, 59, 999);
      }
      mongoQuery.operationDate.$lte = targetEndDate;
    }
  }

  try {

    const logs = await Log.find(mongoQuery)
      .sort({ operationDate: -1 }) 
      .limit(100);

    return res.json({
      success: true,
      resultsCount: logs.length,
      filtersApplied: Object.keys(mongoQuery),
      logs
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Error querying the NoSQL log collection.' 
    });
  }
});

module.exports = router;