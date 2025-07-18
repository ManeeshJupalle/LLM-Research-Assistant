import React from 'react';
import { FileText } from 'lucide-react';

export interface Paper {
  _id: string;
  title: string;
  authors: string;
  uploadDate: string;
  summary?: string;
}

interface PaperCardProps {
  paper: Paper;
  onSelect: (paper: Paper) => void;
}

const PaperCard: React.FC<PaperCardProps> = ({ paper, onSelect }) => (
  <div 
    className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-blue-500"
    onClick={() => onSelect(paper)}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 mb-2">{paper.title}</h3>
        <p className="text-sm text-gray-600 mb-1">Authors: {paper.authors}</p>
        <p className="text-sm text-gray-500">{new Date(paper.uploadDate).toLocaleDateString()}</p>
      </div>
      <FileText className="w-5 h-5 text-gray-400 ml-2" />
    </div>
  </div>
);

export default PaperCard;