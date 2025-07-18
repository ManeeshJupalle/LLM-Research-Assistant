import React from 'react';

export interface Chat {
  question: string;
  answer?: string;
}

interface ChatMessageProps {
  chat: Chat;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ chat }) => (
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

export default ChatMessage;