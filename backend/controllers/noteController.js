const Note = require('../models/Note');

// 获取用户笔记列表
const getNotes = async (req, res) => {
    try {
        const userId = req.userId;
        const notes = await Note.find({ userId });
        res.json({ success: true, notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// 获取特定笔记
const getNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const note = await Note.findOne({ _id: id, userId });
        if (note) {
            res.json({ success: true, note });
        } else {
            res.status(404).json({ success: false, message: 'Note not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// 创建笔记
const createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.userId;
        const newNote = new Note({ title, content, userId });
        await newNote.save();
        res.json({ success: true, message: 'Note created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// 更新笔记
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { title, content } = req.body;
        const updatedNote = await Note.findOneAndUpdate(
            { _id: id, userId },
            { title, content, lastModifiedAt: new Date() },
            { new: true }
        );
        if (updatedNote) {
            res.json({ success: true, message: 'Note updated successfully', note: updatedNote });
        } else {
            res.status(404).json({ success: false, message: 'Note not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// 删除笔记
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const deletedNote = await Note.findOneAndDelete({ _id: id, userId });
        if (deletedNote) {
            res.json({ success: true, message: 'Note deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Note not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote };
