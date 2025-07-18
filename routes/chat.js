const express = require('express');
const OpenAI = require('openai');
const Chat = require('../models/Chat');
const Paper = require('../models/Paper');
require('dotenv').config();

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ask question about paper
router.post('/papers/:id/ask', async (req, res) => {
  try {
    const { question } = req.body;
    const paper = await Paper.findById(req.params.id);
    
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Use paper content for context
    const contextText = paper.textContent || paper.summary || '';
    const maxContextLength = 6000;
    const context = contextText.length > maxContextLength 
      ? contextText.substring(0, maxContextLength) + '...'
      : contextText;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a research assistant helping users understand research papers. Answer questions based on the provided paper content. If the answer isn't in the paper, say so clearly."
        },
        {
          role: "user",
          content: `Based on this research paper:\n          \nTitle: ${paper.title}\nAuthors: ${paper.authors}\n\nContent: ${context}\n\nQuestion: ${question}\n\nPlease provide a detailed answer based on the paper content.`
        }
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const answer = completion.choices[0].message.content;

    // Save to chat history
    const chatEntry = new Chat({
      paperId: paper._id,
      question,
      answer,
      userId: req.body.userId || 'anonymous',
    });

    await chatEntry.save();

    res.json({ question, answer, timestamp: new Date() });
  } catch (error) {
    console.error('Error processing question:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

// Get chat history for a paper
router.get('/papers/:id/chat', async (req, res) => {
  try {
    const chats = await Chat.find({ paperId: req.params.id }).sort({ timestamp: 1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;