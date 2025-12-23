require('dotenv').config();
const fs = require('fs');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function embedFaqs() {
  const faqs = JSON.parse(fs.readFileSync('./data/faqs.json', 'utf-8'));
  const embeddedFaqs = [];

  for (const faq of faqs) {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: faq.text
    });

    embeddedFaqs.push({
      id: faq.id,
      text: faq.text,
      embedding: response.data[0].embedding
    });
  }

  fs.writeFileSync('./data/faqs_with_embeddings.json', JSON.stringify(embeddedFaqs, null, 2));
  console.log('✅ Embeddings saved to faqs_with_embeddings.json');
}

embedFaqs();