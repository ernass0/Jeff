import fetch from 'node-fetch';
import fs from 'fs';

const hfToken = process.env.HF_API_TOKEN;

// Ask Hugging Face model to generate repo changes
async function generateFilesFromAI(instructions) {
  const prompt = `You are an AI coding assistant. 
Read the instructions below and return a JSON object:
- Keys: file paths
- Values: file content
- Use "__DELETE__" as value if file should be deleted.

Instructions:
${instructions}`;

  const res = await fetch('https://api-inference.huggingface.co/models/HuggingFaceH4/starchat2-15b-v0.1', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + hfToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 800, temperature: 0.7 }
    })
  });

  const data = await res.json();
  if (data.error) {
    console.error('Hugging Face API error:', data.error);
    throw new Error(data.error);
  }

  try {
    return JSON.parse(data[0].generated_text);
  } catch (e) {
    console.error('AI output invalid JSON:', data);
    throw e;
  }
}

// Apply changes to repo
async function applyChanges(changes) {
  for (const [file, content] of Object.entries(changes)) {
    if (content === '__DELETE__') {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`Deleted file: ${file}`);
      }
    } else {
      fs.mkdirSync(file.split('/').slice(0, -1).join('/'), { recursive: true });
      fs.writeFileSync(file, content);
      console.log(`Updated/created file: ${file}`);
    }
  }
}

async function main() {
  const instructions = fs.readFileSync('AI_COMMANDS.md', 'utf8');
  console.log('Instructions loaded from AI_COMMANDS.md');

  const changes = await generateFilesFromAI(instructions);
  await applyChanges(changes);

  console.log('AI changes applied successfully.');
}

main().catch(err => {
  console.error('Error running dynamic updater:', err);
  process.exit(1);
});
