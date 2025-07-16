import React, { useState, useRef } from 'react';
import { Upload, FileText, MessageSquare, BookOpen, Search, User, Settings, Download, Eye, Trash2, Plus } from 'lucide-react';

const ResearchReaderApp = () => {
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [summary, setSummary] = useState('');
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('papers');
  const fileInputRef = useRef(null);

  // Mock data for demonstration
  const mockPapers = [
    { id: 1, title: 'Attention Is All You Need', authors: 'Vaswani et al.', date: '2017', type: 'pdf' },
    { id: 2, title: 'BERT: Pre-training of Deep Bidirectional Transformers', authors: 'Devlin et al.', date: '2018', type: 'pdf' },
    { id: 3, title: 'GPT-3: Language Models are Few-Shot Learners', authors: 'Brown et al.', date: '2020', type: 'pdf' }
  ];

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newPapers = files.map((file, index) => ({
      id: papers.length + index + 1,
      title: file.name.replace('.pdf', ''),
      authors: 'Unknown',
      date: new Date().getFullYear().toString(),
      type: file.type,
      file: file
    }));
    setPapers([...papers, ...newPapers]);
  };

  const generateSummary = async (paper) => {
    setLoading(true);
    // Mock API call - replace with actual LLM integration
    setTimeout(() => {
      setSummary(`This paper "${paper.title}" presents groundbreaking research in the field. The authors propose a novel approach that significantly advances our understanding of the subject matter. Key contributions include innovative methodologies and comprehensive experimental validation. The results demonstrate substantial improvements over existing approaches, with implications for future research directions.`);
      setLoading(false);
    }, 2000);
  };

  const handleQuestion = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    const newChat = { question, answer: '', timestamp: new Date() };
    setChatHistory([...chatHistory, newChat]);
    
    // Mock API call - replace with actual LLM integration
    setTimeout(() => {
      const answer = `Based on the paper "${selectedPaper?.title}", here's my analysis: ${question} - This is a thoughtful question that relates to the core concepts discussed in the paper. The authors address this through their experimental methodology and provide compelling evidence for their claims.`;
      setChatHistory(prev => prev.map((chat, idx) => 
        idx === prev.length - 1 ? { ...chat, answer } : chat
      ));
      setQuestion('');
      setLoading(false);
    }, 1500);
  };

  const PaperCard = ({ paper, onSelect }) => (
    <div 
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-blue-500"
      onClick={() => onSelect(paper)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-2">{paper.title}</h3>
          <p className="text-sm text-gray-600 mb-1">Authors: {paper.authors}</p>
          <p className="text-sm text-gray-500">{paper.date}</p>
        </div>
        <FileText className="w-5 h-5 text-gray-400 ml-2" />
      </div>
    </div>
  );

  const ChatMessage = ({ chat }) => (
    <div className="mb-4">
      <div className="bg-blue-50 p-3 rounded-lg mb-2">
        <p className="text-sm font-medium text-blue-800">Q: {chat.question}</p>
      </div>
      {chat.answer && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">A: {chat.answer}</p>
        </div>
      )}
    </div>
  );

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Papers Library */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Paper Library</h2>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
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
                      key={paper.id}
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
                  <p className="text-gray-600">by {selectedPaper.authors} ({selectedPaper.date})</p>
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
                            Ask
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
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
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
