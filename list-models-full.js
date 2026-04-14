const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    if (data.models) {
      const names = data.models.map(m => m.name).sort();
      console.log('---MODEL_LIST_START---');
      names.forEach(n => console.log(n));
      console.log('---MODEL_LIST_END---');
    } else {
      console.log('No models found:', JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
