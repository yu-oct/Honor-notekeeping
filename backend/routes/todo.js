const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// @route   GET api/todos
// @desc    Get all todos
// @access  Private
router.post('/', async (req, res) => {
    try {
      const { title, todos } = req.body;
  
      const newTodoList = new Todo({
        title,
        todos,
        user: req.user.id
      });
  
      const todoList = await newTodoList.save();
  
      res.json(todoList);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  

// Add more routes for creating, updating, deleting todos, etc.

module.exports = router;
