const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Defina suas rotas aqui
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

module.exports = router;