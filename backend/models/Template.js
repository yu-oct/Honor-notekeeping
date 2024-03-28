// models/Template.js

const mongoose = require('mongoose');

// 定义模板模型的模式（Schema）
const templateSchema = new mongoose.Schema({
    templateType: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    }
});

// 创建模板模型
const Template = mongoose.model('Template', templateSchema);

module.exports = Template;
