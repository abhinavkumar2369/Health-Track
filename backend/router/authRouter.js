const express = require('express');
const authRouter = express.Router();

const signUp = require('../auth/signUp');
const signIn = require('../auth/signIn');

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);


module.exports = authRouter;