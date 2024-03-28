
const express = require('express');
const router = express.Router();
const Template = require('../models/Template.js');

// Route to get all templates
router.get('/templates', async (req, res) => {
    try {
        const templates = await Template.find();
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
