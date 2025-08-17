// src/ai-dynamic-updater.js
import fetch from 'node-fetch';
import { Octokit } from 'octokit';
import fs from 'fs';

const token = process.env.GH_TOKEN;
const hfToken = process.env.HF_API_TOKEN;
const octokit = new Octokit({ auth: token });
const repoOwner = process.env.GITHUB_REPOSITORY.split('/')[0];
const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
const branch = process.env.BRANCH || 'main';

async function readFile(path) {
  try {
    const { data } = await octokit.rest.repos.getContent({ owner: repoOwner, repo: repoName, path, ref: branch });
    return { content: Buffer.from(data.content,'base64').toString('utf8'), sha: data.sha };
  } catch(e) { if(e.status===404) return null; else throw e; }
}

async function commitFile(path, content, message, sha=null) {
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: repoOwner,
    repo: repoName,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    sha,
    branch
  });
  console.log('Committed:', path);
}

async function generateFilesFromAI(instructions) {
  const prompt = `You are an AI coding assistant. 
Read the instructions below and return a JSON object:
- Keys: file paths
- Values: file content
- Use '__DELETE__' to delete a file

Instructions:
${instructions}`;

  const res = await fetch('https://api-inference.huggingface.co/models/bigcode/starcoder', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + hfToken, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 500, temperature: 0.7 } })
  });
  const data = await res.json();
  try { return JSON.parse(data[0].generated_text); }
  catch(e) { console.error('AI output invalid JSON:', data); throw e; }
}

async function main() {
  const instructionsFile = 'AI_COMMANDS.md';
  const instructions = await readFile(instructionsFile);
  if(!instructions) return console.log('Instructions file not found.');

  const fileMap = await generateFilesFromAI(instructions.content);

  for(const path in fileMap) {
    const content = fileMap[path];
    const existing = await readFile(path);

    if(content==='__DELETE__') {
      if(existing) {
        await octokit.rest.repos.deleteFile({ owner: repoOwner, repo: repoName, path, message:'AI: Deleted file', sha: existing.sha, branch });
        console.log('Deleted:', path);
      }
      continue;
    }
    await commitFile(path, content, existing?'AI: Updated file':'AI: Created file', existing?.sha);
  }
}

main().catch(console.error);
