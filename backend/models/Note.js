// models/Note.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
    lastModifiedAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Note', noteSchema);
