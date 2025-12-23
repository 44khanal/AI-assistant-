import fs from 'fs';
import { config } from 'dotenv';
import OpenAI from 'openai';

config(); // Load .env

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function embedFaqs() {
  const faqs = JSON.parse(fs.readFileSync('./data/faqs.json', 'utf-8'));
  const embeddedFaqs = [];

  for (const faq of faqs) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: faq.text
      });

      embeddedFaqs.push({
        id: faq.id,
        text: faq.text,
        embedding: response.data[0].embedding
      });
    } catch (err) {
      console.error(`❌ Error embedding FAQ ${faq.id}:`, err.message);
    }
  }

  fs.writeFileSync('./data/faqs_with_embeddings.json', JSON.stringify(embeddedFaqs, null, 2));
  console.log('✅ Embeddings saved to faqs_with_embeddings.json');
}

embedFaqs();