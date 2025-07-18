import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, MessageSquare, BookOpen, Search, User, Settings, Download, Eye, Trash2, Plus, AlertCircle } from 'lucide-react';
import PaperCard, { Paper } from './components/PaperCard';
import ChatMessage, { Chat } from './components/ChatMessage';
import ErrorMessage from './components/ErrorMessage';

const API_BASE_URL = 'http://localhost:5000/api';

const ResearchReaderApp = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [summary, setSummary] = useState('');
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('papers');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Fetch papers on component mount
  useEffect(() => {
    fetchPapers();
  }, []);

  // Fetch chat history and notes when paper is selected
  useEffect(() => {
    if (selectedPaper) {
      fetchChatHistory(selectedPaper._id);
      fetchNotes(selectedPaper._id);
      setSummary(selectedPaper.summary || '');
    }
  }, [selectedPaper]);

  const fetchPapers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/papers`);
      const data = await response.json();
      setPapers(data);
    } catch (error) {
      console.error('Error fetching papers:', error);
      setError('Failed to load papers');
    }
  };

  const fetchChatHistory = async (paperId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/papers/${paperId}/chat`);
      const data = await response.json();
      setChatHistory(data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const fetchNotes = async (paperId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/papers/${paperId}/notes`);
      const data = await response.json();
      setNotes(data.content || '');
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setUploadLoading(true);
    setError('');

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('paper', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
        formData.append('authors', 'Unknown');

        const response = await fetch(`${API_BASE_URL}/papers/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }
      }

      await fetchPapers();
      setError('');
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Failed to upload files');
    } finally {
      setUploadLoading(false);
    }
  };

  const generateSummary = async (paper) => {
    if (!paper._id) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/papers/${paper._id}/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
      
      // Update the paper in the list
      setPapers(papers.map(p => 
        p._id === paper._id ? { ...p, summary: data.summary } : p
      ));
    } catch (error) {
      console.error('Error generating summary:', error);
      setError('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestion = async () => {
    if (!question.trim() || !selectedPaper) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/papers/${selectedPaper._id}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      setChatHistory(prev => [...prev, data]);
      setQuestion('');
    } catch (error) {
      console.error('Error asking question:', error);
      setError('Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!selectedPaper) return;

    try {
      const response = await fetch(`${API_BASE_URL}/papers/${selectedPaper._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notes');
      }

      setError('');
      // Could add a success message here
    } catch (error) {
      console.error('Error saving notes:', error);
      setError('Failed to save notes');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Research Reader</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Settings className="w-5 h-5 text-gray-600 cursor-pointer" />
              <User className="w-5 h-5 text-gray-600 cursor-pointer" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <ErrorMessage message={error} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Papers Library */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Paper Library</h2>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLoading}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadLoading ? 'Uploading...' : 'Upload'}</span>
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="space-y-3">
                {papers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No papers uploaded yet</p>
                    <p className="text-sm">Upload your first research paper to get started</p>
                  </div>
                ) : (
                  papers.map(paper => (
                    <PaperCard
                      key={paper._id}
                      paper={paper}
                      onSelect={setSelectedPaper}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Main Content */}
          <div className="lg:col-span-2">
            {selectedPaper ? (
              <div className="bg-white rounded-lg shadow-md">
                {/* Paper Header */}
                <div className="border-b p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedPaper.title}</h2>
                  <p className="text-gray-600">by {selectedPaper.authors} ({new Date(selectedPaper.uploadDate).getFullYear()})</p>
                </div>

                {/* Tabs */}
                <div className="border-b">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'summary', label: 'Summary', icon: FileText },
                      { id: 'qa', label: 'Q&A', icon: MessageSquare },
                      { id: 'notes', label: 'Notes', icon: Plus }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 flex items-center space-x-2 text-sm font-medium border-b-2 ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'summary' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">AI Summary</h3>
                        <button
                          onClick={() => generateSummary(selectedPaper)}
                          disabled={loading}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {loading ? 'Generating...' : 'Generate Summary'}
                        </button>
                      </div>
                      {summary ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 leading-relaxed">{summary}</p>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>Click "Generate Summary" to create an AI-powered summary</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'qa' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Ask Questions</h3>
                      <div className="mb-4">
                        <div className="flex space-x-3">
                          <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask a question about this paper..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === 'Enter' && handleQuestion()}
                          />
                          <button
                            onClick={handleQuestion}
                            disabled={loading || !question.trim()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loading ? 'Asking...' : 'Ask'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {chatHistory.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No questions asked yet</p>
                            <p className="text-sm">Ask your first question about this paper</p>
                          </div>
                        ) : (
                          chatHistory.map((chat, index) => (
                            <ChatMessage key={index} chat={chat} />
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Personal Notes</h3>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Write your notes and thoughts about this paper..."
                        className="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={saveNotes}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">Select a Paper to Begin</h2>
                <p className="text-gray-500">Choose a paper from your library to start reading, summarizing, and asking questions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchReaderApp;
