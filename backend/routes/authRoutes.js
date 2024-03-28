const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register); // 确保 register 函数被正确导入和使用
router.post('/login', login); // 确保 login 函数被正确导入和使用

module.exports = router;
