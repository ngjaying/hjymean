'use strict';

var express = require('express');
var controller = require('./launchy.controller');

var router = express.Router();

router.get('/:id', controller.showStatus);
router.post('/:id', controller.launch);
router.delete('/:id', controller.stop);

module.exports = router;
