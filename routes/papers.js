const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pdf = require('pdf-parse');
const OpenAI = require('openai');
const Paper = require('../models/Paper');
require('dotenv').config();

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/papers';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, and DOC files are allowed.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

// Helper function to extract text from TXT
function extractTextFromTXT(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Error reading TXT file:', error);
    return '';
  }
}

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Research Reader API is running' });
});

// Get all papers
router.get('/papers', async (req, res) => {
  try {
    const papers = await Paper.find().sort({ uploadDate: -1 });
    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload paper
router.post('/papers/upload', upload.single('paper'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let textContent = '';
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    // Extract text based on file type
    if (fileExtension === '.pdf') {
      textContent = await extractTextFromPDF(filePath);
    } else if (fileExtension === '.txt') {
      textContent = extractTextFromTXT(filePath);
    }

    // Create paper document
    const paper = new Paper({
      title: req.body.title || path.basename(req.file.originalname, path.extname(req.file.originalname)),
      authors: req.body.authors || 'Unknown',
      filename: req.file.originalname,
      filepath: filePath,
      textContent: textContent,
      userId: req.body.userId || 'anonymous',
    });

    await paper.save();
    res.json(paper);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific paper
router.get('/papers/:id', async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    res.json(paper);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate summary
router.post('/papers/:id/summary', async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    if (!paper.textContent) {
      return res.status(400).json({ error: 'No text content available for summarization' });
    }

    // Truncate text if too long (OpenAI has token limits)
    const maxLength = 8000; // Adjust based on your needs
    const textToSummarize = paper.textContent.length > maxLength 
      ? paper.textContent.substring(0, maxLength) + '...'
      : paper.textContent;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a research assistant. Provide a comprehensive summary of the research paper, including key findings, methodology, and conclusions. Be concise but thorough."
        },
        {
          role: "user",
          content: `Please summarize this research paper:\n\nTitle: ${paper.title}\nAuthors: ${paper.authors}\n\nContent:\n${textToSummarize}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const summary = completion.choices[0].message.content;
    
    // Save summary to database
    paper.summary = summary;
    await paper.save();

    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Delete paper
router.delete('/papers/:id', async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(paper.filepath)) {
      fs.unlinkSync(paper.filepath);
    }

    // Delete from database
    await Paper.findByIdAndDelete(req.params.id);
    
    // Related notes and chats should be deleted in their respective routes

    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;