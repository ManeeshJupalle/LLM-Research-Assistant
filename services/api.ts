import { Paper } from '../components/PaperCard';
import { Chat } from '../components/ChatMessage';

const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchPapers(): Promise<Paper[]> {
  const response = await fetch(`${API_BASE_URL}/papers`);
  if (!response.ok) throw new Error('Failed to fetch papers');
  return response.json();
}

export async function uploadPaper(file: File, title: string, authors: string): Promise<Paper> {
  const formData = new FormData();
  formData.append('paper', file);
  formData.append('title', title);
  formData.append('authors', authors);
  const response = await fetch(`${API_BASE_URL}/papers/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}

export async function fetchChatHistory(paperId: string): Promise<Chat[]> {
  const response = await fetch(`${API_BASE_URL}/papers/${paperId}/chat`);
  if (!response.ok) throw new Error('Failed to fetch chat history');
  return response.json();
}

export async function fetchNotes(paperId: string): Promise<{ content: string }> {
  const response = await fetch(`${API_BASE_URL}/papers/${paperId}/notes`);
  if (!response.ok) throw new Error('Failed to fetch notes');
  return response.json();
}

export async function generateSummary(paperId: string): Promise<{ summary: string }> {
  const response = await fetch(`${API_BASE_URL}/papers/${paperId}/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to generate summary');
  return response.json();
}

export async function askQuestion(paperId: string, question: string): Promise<Chat> {
  const response = await fetch(`${API_BASE_URL}/papers/${paperId}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!response.ok) throw new Error('Failed to get answer');
  return response.json();
}

export async function saveNotes(paperId: string, content: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/papers/${paperId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('Failed to save notes');
}