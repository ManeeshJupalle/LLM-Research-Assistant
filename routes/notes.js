const express = require('express');
const Note = require('../models/Note');

const router = express.Router();

// Save/update notes
router.post('/papers/:id/notes', async (req, res) => {
  try {
    const { content } = req.body;
    const paperId = req.params.id;
    const userId = req.body.userId || 'anonymous';

    let note = await Note.findOne({ paperId, userId });
    
    if (note) {
      note.content = content;
      note.updatedAt = new Date();
    } else {
      note = new Note({
        paperId,
        content,
        userId,
      });
    }

    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notes for a paper
router.get('/papers/:id/notes', async (req, res) => {
  try {
    const userId = req.query.userId || 'anonymous';
    const note = await Note.findOne({ paperId: req.params.id, userId });
    res.json(note || { content: '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;