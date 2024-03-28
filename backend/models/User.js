// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    favorite: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }]
});

const User = mongoose.model('User', userSchema);