import fetch from 'node-fetch';
import fs from 'fs';

const hfToken = process.env.HF_API_TOKEN;

// Generate content using Hugging Face Starchat2 model
async function generateContent(prompt) {
  console.log('Generating content with prompt length:', prompt.length);
  const res = await fetch('https://api-inference.huggingface.co/models/HuggingFaceH4/starchat2-15b-v0.1', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + hfToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 500, temperature: 0.7 }
    })
  });

  const data = await res.json();
  if (data.error) {
    console.error('Hugging Face API error:', data.error);
    return '';
  }

  return data[0].generated_text;
}

// Main function
async function main() {
  const prompt = fs.readFileSync('AI_COMMANDS.md', 'utf8');
  const output = await generateContent(prompt);

  fs.writeFileSync('AI_OUTPUT.md', output);
  console.log('AI output written to AI_OUTPUT.md');
}

main().catch(err => {
  console.error('Error running AI bot:', err);
  process.exit(1);
});
