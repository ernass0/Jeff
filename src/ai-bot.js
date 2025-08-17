import fetch from 'node-fetch';
import { Octokit } from 'octokit';
import fs from 'fs';

const token = process.env.GH_TOKEN;
const hfToken = process.env.HF_API_TOKEN;
const octokit = new Octokit({ auth: token });

const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split('/');
const branch = process.env.BRANCH || 'main';

// List all files in the repo recursively
async function listFiles(path = '') {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path,
      ref: branch
    });

    let files = [];
    for (const item of data) {
      if (item.type === 'file') files.push(item.path);
      else if (item.type === 'dir') files = files.concat(await listFiles(item.path));
    }
    return files;
  } catch (e) {
    if (e.status === 404) return [];
    else throw e;
  }
}

// Read a file from the repo
async function readFile(filePath) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: filePath,
      ref: branch
    });

    return { content: Buffer.from(data.content, 'base64').toString('utf8'), sha: data.sha };
  } catch (e) {
    if (e.status === 404) return null;
    else throw e;
  }
}

// Create or update a file in the repo
async function commitFile(path, content, message, sha = null) {
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

// Delete a file from the repo
async function deleteFile(path, sha) {
  await octokit.rest.repos.deleteFile({
    owner: repoOwner,
    repo: repoName,
    path,
    message: 'AI: Deleted file',
    sha,
    branch
  });
  console.log('Deleted:', path);
}

// Generate content using Hugging Face model
async function generateContent(prompt) {
  const res = await fetch('https://api-inference.huggingface.co/models/bigcode/starcoder', {
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
  return data[0].generated_text;
}

// Main function to manage files
async function autoManageFiles() {
  // 1. Delete any temporary files
  const files = await listFiles();
  for (const f of files) {
    if (f.endsWith('.temp')) {
      const fileData = await readFile(f);
      await deleteFile(f, fileData.sha);
    }
  }

  // 2. Decide which files to create or update
  const targetFiles = ['src/main.js', 'docs/INSTRUCTIONS.md', 'data/info.json'];

  for (const f of targetFiles) {
    const fileData = await readFile(f);
    const prompt = fileData
      ? 'Improve or fix this file, add instructions/comments:\n' + fileData.content
      : 'Create a new file with useful code/info for the project. Include instructions, examples, content.';

    const newContent = await generateContent(prompt);
    await commitFile(f, newContent, 'AI: Created/Updated file', fileData?.sha);
  }
}

// Run the bot
autoManageFiles().catch(console.error);
