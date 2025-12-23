import express from 'express';
import bodyParser from 'body-parser';
import { getAIResponse } from './openai.js';
import { searchLocalKnowledgeBase } from './utils/searchLocal.js';
import cors from 'cors';

const app = express();
const PORT = 3001;
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('AI Customer Service Backend is running');
});

app.post('/ask', async (req, res) => {
  const { question } = req.body;

  const localAnswer = searchLocalKnowledgeBase(question);
  if (localAnswer) {
    return res.json({ answer: localAnswer });
  }

  try {
    const aiAnswer = await getAIResponse(question);
    res.json({ answer: aiAnswer });
  } catch (error) {
    console.error('Error fetching AI response:', error);
    res.status(500).json({ error: 'AI response failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});