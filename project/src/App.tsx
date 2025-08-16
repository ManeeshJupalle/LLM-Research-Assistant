import React, { useState, useRef } from 'react';
import { FileText, Upload, MessageSquare, Search, Brain, BookOpen, Menu, Sparkles, Download, Users, Zap } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { ProfileDropdown } from './components/ProfileDropdown';
import { Chatbot } from './components/Chatbot';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl mb-4 inline-block">
            <Brain className="h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading ResearchAI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Landing Page Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ResearchAI
                    </h1>
                    <p className="text-xs text-gray-500">Intelligent Research Assistant</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Landing Page Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 w-24 h-24 rounded-3xl mx-auto flex items-center justify-center mb-8">
              <Brain className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Your AI-Powered
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Research Assistant
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Upload research papers, ask intelligent questions, and discover insights with the power of AI. 
              Transform how you analyze and understand complex research documents.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Start Researching Free
              </button>
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
                Watch Demo
              </button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Upload</h3>
                <p className="text-gray-600">Drag & drop PDF research papers and documents for instant analysis</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Chat</h3>
                <p className="text-gray-600">Ask questions and get intelligent insights about your research</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover</h3>
                <p className="text-gray-600">Find related research papers and expand your knowledge</p>
              </div>
            </div>
          </div>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return <ResearchInterface />;
};

const ResearchInterface: React.FC = () => {
  interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: Date;
    summary?: string;
  }

  interface ResearchPaper {
    id: string;
    title: string;
    authors: string[];
    abstract: string;
    year: number;
    citations: number;
    url: string;
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mockResearchPapers = [
    {
      id: '1',
      title: 'Attention Is All You Need',
      authors: ['Vaswani et al.'],
      abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
      year: 2017,
      citations: 45232,
      url: '#'
    },
    {
      id: '2',
      title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
      authors: ['Devlin et al.'],
      abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers...',
      year: 2018,
      citations: 35417,
      url: '#'
    },
    {
      id: '3',
      title: 'GPT-3: Language Models are Few-Shot Learners',
      authors: ['Brown et al.'],
      abstract: 'Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text...',
      year: 2020,
      citations: 12847,
      url: '#'
    }
  ];

  const handleFileUpload = (files: FileList) => {
    setIsProcessing(true);
    
    Array.from(files).forEach((file) => {
      const newDoc: Document = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date(),
        summary: 'Document uploaded successfully. Ready for analysis.'
      };

      setDocuments(prev => [...prev, newDoc]);
    });

    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ResearchAI
                </h1>
                <p className="text-xs text-gray-500">Intelligent Research Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ProfileDropdown />
              <div className="hidden md:flex items-center space-x-6">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>1.2k+ Researchers</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Zap className="h-4 w-4" />
                  <span className="text-green-600">AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative inset-y-0 left-0 w-80 bg-white/90 backdrop-blur-md border-r border-gray-200 transition-transform duration-300 ease-in-out z-40`}>
          <div className="p-6 h-full overflow-y-auto">
            {/* Tab Navigation */}
            <div className="flex space-x-1 p-1 bg-gray-100 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'upload' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className="h-4 w-4 inline mr-2" />
                Upload
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'library' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen className="h-4 w-4 inline mr-2" />
                Library
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'discover' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Search className="h-4 w-4 inline mr-2" />
                Discover
              </button>
            </div>

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">Upload Research Papers</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Drag & drop PDF files or click to browse
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Supports PDF, DOC, DOCX • Max 10MB
                      </p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm text-gray-500 font-medium">or</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <Upload className="h-5 w-5" />
                  <span>Browse Files</span>
                </button>

                {isProcessing && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                      <span className="text-sm font-medium text-blue-700">
                        Processing documents...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Library Tab */}
            {activeTab === 'library' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your documents..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                        selectedDocument?.id === doc.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <FileText className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {doc.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(doc.size)} • {doc.uploadDate.toLocaleDateString()}
                          </p>
                          {doc.summary && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                              {doc.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {documents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No documents uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Discover Tab */}
            {activeTab === 'discover' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search research papers..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                    Recommended Papers
                  </h3>
                  
                  {mockResearchPapers.map(paper => (
                    <div key={paper.id} className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer">
                      <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                        {paper.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {paper.authors.join(', ')} • {paper.year}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-3 mb-3">
                        {paper.abstract}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 font-medium">
                          {paper.citations.toLocaleString()} citations
                        </span>
                        <Download className="h-4 w-4 text-gray-400 hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-white/50">
          {/* Mobile Menu Button */}
          <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </button>
              <span className="text-sm text-gray-500">{documents.length} docs</span>
            </div>
          </div>

          {/* Chatbot Component */}
          <Chatbot selectedDocument={selectedDocument} documents={documents} />
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;