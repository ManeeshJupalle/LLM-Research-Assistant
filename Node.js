// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const pdf = require('pdf-parse');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/research_reader', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB Schemas
const paperSchema = new mongoose.Schema({
  title: String,
  authors: String,
  uploadDate: { type: Date, default: Date.now },
  filename: String,
  filepath: String,
  textContent: String,
  summary: String,
  userId: String, // For future auth implementation
});

const noteSchema = new mongoose.Schema({
  paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' },
  content: String,
  userId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' },
  question: String,
  answer: String,
  userId: String,
  timestamp: { type: Date, default: Date.now },
});

const Paper = mongoose.model('Paper', paperSchema);
const Note = mongoose.model('Note', noteSchema);
const Chat = mongoose.model('Chat', chatSchema);

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

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Research Reader API is running' });
});

// Get all papers
app.get('/api/papers', async (req, res) => {
  try {
    const papers = await Paper.find().sort({ uploadDate: -1 });
    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload paper
app.post('/api/papers/upload', upload.single('paper'), async (req, res) => {
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
app.get('/api/papers/:id', async (req, res) => {
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
app.post('/api/papers/:id/summary', async (req, res) => {
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

// Ask question about paper
app.post('/api/papers/:id/ask', async (req, res) => {
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
          content: `Based on this research paper:
          
Title: ${paper.title}
Authors: ${paper.authors}

Content: ${context}

Question: ${question}

Please provide a detailed answer based on the paper content.`
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
app.get('/api/papers/:id/chat', async (req, res) => {
  try {
    const chats = await Chat.find({ paperId: req.params.id }).sort({ timestamp: 1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save/update notes
app.post('/api/papers/:id/notes', async (req, res) => {
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
app.get('/api/papers/:id/notes', async (req, res) => {
  try {
    const userId = req.query.userId || 'anonymous';
    const note = await Note.findOne({ paperId: req.params.id, userId });
    res.json(note || { content: '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete paper
app.delete('/api/papers/:id', async (req, res) => {
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
    
    // Delete related notes and chats
    await Note.deleteMany({ paperId: req.params.id });
    await Chat.deleteMany({ paperId: req.params.id });

    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;
