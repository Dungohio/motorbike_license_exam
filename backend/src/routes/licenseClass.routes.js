const express = require('express');
const { getLicenseClasses } = require('../controllers/licenseClass.controller');

const router = express.Router();

router.get('/', getLicenseClasses);

module.exports = router;
