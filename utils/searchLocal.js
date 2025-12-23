import fs from 'fs';
import path from 'path';

export function searchLocalKnowledgeBase(userQuestion) {
  const filePath = path.resolve('data/faqs.json');
  const faqs = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const match = faqs.find(faq =>
    userQuestion.toLowerCase().includes(faq.question.toLowerCase())
  );

  return match ? match.answer : null;
}