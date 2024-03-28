const express = require('express');
const router = express.Router();
const { getNotes, getNote } = require('../controllers/noteController');

router.get('/', getNotes); // 确保 getNotes 函数被正确导入和使用
router.get('/:id', getNote); // 确保 getNote 函数被正确导入和使用

module.exports = router;
