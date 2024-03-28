const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  completed: { type: Boolean, default: false }, // 新增完成情况字段，默认为未完成
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Todo = mongoose.model('Todo', TodoSchema);
