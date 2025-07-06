const express = require('express');
const authRouter = express.Router();
const { register, login, logout, adminRegister, deleteProfile, check } = require('../controllers/userAuthentication');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware')

//Register
//login
//logout
//getProfile

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware, adminRegister);
authRouter.delete('/deleteprofile', userMiddleware, deleteProfile);
authRouter.get('/check', userMiddleware, check);


// authRouter.post('/getProfile',getProfile);

module.exports = authRouter;