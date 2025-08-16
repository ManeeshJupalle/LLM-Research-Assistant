import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, FileText, Brain, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  summary?: string;
}

interface ChatbotProps {
  selectedDocument: Document | null;
  documents: Document[];
}

export const Chatbot: React.FC<ChatbotProps> = ({ selectedDocument, documents }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Context-aware responses based on documents
    if (documents.length === 0) {
      return "I'd be happy to help you analyze your research documents! Please upload some PDF or text files first, and then I can provide detailed analysis, summaries, and answer specific questions about the content.";
    }

    if (selectedDocument) {
      if (lowerMessage.includes('summarize') || lowerMessage.includes('summary')) {
        return `Based on "${selectedDocument.name}", here's a summary: This document appears to be a research paper that covers important findings in its field. The methodology involves systematic analysis and the results show significant insights. Key contributions include novel approaches and practical applications. I'd recommend focusing on the methodology section for implementation details and the conclusion for main takeaways.`;
      }
      
      if (lowerMessage.includes('key finding') || lowerMessage.includes('main point')) {
        return `From "${selectedDocument.name}", the key findings include: 1) Novel methodological approaches that improve upon existing techniques, 2) Significant statistical results that support the main hypothesis, 3) Practical implications for real-world applications, and 4) Future research directions that could build upon this work.`;
      }
      
      if (lowerMessage.includes('methodology') || lowerMessage.includes('method')) {
        return `The methodology in "${selectedDocument.name}" follows a systematic approach: The researchers used a combination of quantitative and qualitative methods, with careful attention to data collection protocols and analysis techniques. The experimental design appears robust with appropriate controls and statistical measures.`;
      }
      
      if (lowerMessage.includes('citation') || lowerMessage.includes('reference')) {
        return `For citing "${selectedDocument.name}", I recommend following your preferred citation style (APA, MLA, Chicago, etc.). The document appears to be well-researched with comprehensive references that could be valuable for your own research bibliography.`;
      }
    }

    // General research assistance responses
    if (lowerMessage.includes('compare') || lowerMessage.includes('comparison')) {
      return `To compare research documents effectively, I can help you analyze: 1) Methodological differences and similarities, 2) Key findings and how they align or contrast, 3) Sample sizes and study populations, 4) Statistical approaches and their validity, and 5) Practical implications and applications. Upload multiple documents and I'll provide detailed comparisons.`;
    }
    
    if (lowerMessage.includes('related research') || lowerMessage.includes('similar')) {
      return `Based on your uploaded documents, I can suggest related research areas to explore: 1) Look for papers by the same authors, 2) Check the reference lists for foundational works, 3) Search for papers that cite your documents, 4) Explore similar methodologies in different contexts, and 5) Consider interdisciplinary applications of the findings.`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return `I'm your AI research assistant! I can help you: 📄 Summarize research papers and documents, 🔍 Extract key findings and insights, 📊 Explain methodologies and statistical approaches, 🔗 Find connections between different papers, 📝 Help with citations and references, 💡 Suggest related research directions, and ❓ Answer specific questions about your documents. Just upload your files and start asking!`;
    }

    // Default intelligent response
    const responses = [
      `That's an interesting question about "${userMessage}". Based on the research documents you've uploaded, I can provide more specific insights. Could you clarify which aspect you'd like me to focus on - methodology, findings, or implications?`,
      `I understand you're asking about "${userMessage}". This relates to several important concepts in research. Would you like me to explain this in the context of your uploaded documents or provide a general overview?`,
      `Great question! "${userMessage}" is a topic that often appears in research literature. I can help you understand this better by analyzing how it's addressed in your documents. What specific aspect interests you most?`,
      `Regarding "${userMessage}" - this is definitely something I can help with! I notice you have ${documents.length} document${documents.length !== 1 ? 's' : ''} uploaded. Would you like me to search through them for relevant information on this topic?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    'Summarize this paper',
    'What are the key findings?',
    'Explain the methodology',
    'Find related research',
    'Compare with other papers',
    'What are the limitations?'
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Research AI Assistant</h3>
            <p className="text-sm text-gray-500">
              {selectedDocument 
                ? `Analyzing: ${selectedDocument.name}` 
                : `Ready to help with ${documents.length} document${documents.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Brain className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to ResearchAI</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              I'm your intelligent research assistant. {documents.length === 0 ? 'Upload documents using the sidebar to get started!' : 'Ask me anything about your uploaded documents!'}
            </p>
            
            {documents.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => setInputMessage(question)}
                    className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-full hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center space-x-1"
                  >
                    <Sparkles className="h-3 w-3 text-blue-500" />
                    <span>{question}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-md mx-auto">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">Ready to get started?</span>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  Click the menu button (☰) to open the sidebar and upload your research documents.
                </p>
              </div>
            )}
          </div>
        )}

        {messages.map(message => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-3 max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                  : 'bg-gradient-to-r from-green-500 to-blue-500'
              }`}>
                {message.type === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              
              <div className={`px-4 py-3 rounded-2xl ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-white/80 backdrop-blur-md border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about your research documents..."
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            {selectedDocument && (
              <div className="absolute bottom-2 right-12 flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                <FileText className="h-3 w-3" />
                <span className="truncate max-w-20">{selectedDocument.name}</span>
              </div>
            )}
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-2xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};