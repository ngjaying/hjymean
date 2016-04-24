'use strict';

import express from 'express';
import passport from 'passport';
import config from '../config/environment';
import User from '../api/user/user.model';
import { setup as localSetup } from './local/passport';
import { setup as googleSetup } from './google/passport';

// Passport Configuration
localSetup(User, config);
googleSetup(User, config);

var router = express.Router();

router.use('/local', require('./local').default);
router.use('/google', require('./google').default);

export default router;
