'use strict';

var express = require('express');
var router = express.Router();
var controller = require('./monitor.controller');

router.get('/launch', controller.launch);

module.exports = router;