require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = 3001;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const logger = {
  info: (msg) => console.log(`[${new Date().toLocaleTimeString('en-GB')}] [INFO] ${msg}`),
  error: (msg, err) => console.error(`[${new Date().toLocaleTimeString('en-GB')}] [ERROR] ${msg}`, err || ''),
  log: (msg) => console.log(`[${new Date().toLocaleTimeString('en-GB')}] [LOG] ${msg}`)
};

app.use(express.json());
app.use(cors());

app.post('/analisar', async (req, res) => {
  const { word, sentence, language = "Portuguese" } = req.body;

  if (!word || !sentence) {
    return res.status(400).json({ error: "Word and sentence are required." });
  }

  // Regex para extrair a frase de contexto
  const sentenceRegex = new RegExp(`([^.!?]*\\b${word}\\b[^.!?]*[.!?])`, 'i');
  const match = sentence.match(sentenceRegex);
  const targetSentence = match ? match[0].trim() : sentence;

  logger.log(`Analyzing: "${word}" | Target Language: ${language}`);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a linguistic expert. Respond ONLY in valid JSON.
          The "definition" and "context_definition" must be in ENGLISH.
          The "word_translation" and "sentence_translation" must be in ${language.toUpperCase()}.
          
          Structure: 
          {
            "definition": "English dictionary definition", 
            "synonyms": [], 
            "context_definition": "Specific meaning in this sentence (in English)", 
            "word_translation": "Translation of the word to ${language}", 
            "sentence_translation": "Full translation of the sentence to ${language}"
          }`
        },
        {
          role: "user",
          content: `Word: "${word}". Context Sentence: "${targetSentence}"`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = JSON.parse(response.choices[0].message.content);
    logger.info(`Success: "${word}" processed.`);
    res.status(200).json(content);

  } catch (error) {
    logger.error(`OpenAI Error:`, error.message);
    res.status(500).json({ error: "Failed to process with AI." });
  }
});

app.listen(port, () => {
  logger.info(`Server running with GPT-4o-mini on port ${port}`);
});