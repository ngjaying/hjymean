'use strict';

var express = require('express');
var router = express.Router();
var controller = require('./monitor.controller');

router.get('/launch', controller.launch);

export default router;