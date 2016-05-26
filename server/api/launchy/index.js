'use strict';

var express = require('express');
var controller = require('./launchy.controller');

var router = express.Router();

router.get('/:monitor', controller.showStatus);
router.post('/', controller.launch);
router.delete('/:monitor', controller.stop);

module.exports = router;
