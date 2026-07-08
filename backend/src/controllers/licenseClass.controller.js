const LicenseClass = require('../models/LicenseClass');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/license-classes
const getLicenseClasses = asyncHandler(async (req, res) => {
  const classes = await LicenseClass.find().sort({ code: 1 });
  res.json(classes);
});

module.exports = { getLicenseClasses };
