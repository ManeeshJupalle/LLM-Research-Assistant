import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  message ? (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center">
      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
      <span className="text-red-700">{message}</span>
    </div>
  ) : null
);

export default ErrorMessage;