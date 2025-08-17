import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { Octokit } from "octokit";
import fs from "fs";

const token = process.env["GITHUB_TOKEN"];
const repoOwner = "ernass0";
const repoName = "Jeff";
const branch = "main";

// GitHub API
const octokit = new Octokit({ auth: token });

// AI Model Client
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";
const aiClient = ModelClient(endpoint, new AzureKeyCredential(token));

// ---------------- Utility Functions ----------------

// Read file
async function readFile(filePath) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: filePath,
      ref: branch,
    });
    const content = Buffer.from(data.content, "base64").toString("utf8");
    return { content, sha: data.sha };
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

// Create or update file
async function commitFile(filePath, newContent, message, sha) {
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: repoOwner,
    repo: repoName,
    path: filePath,
    message,
    content: Buffer.from(newContent).toString("base64"),
    sha,
    branch,
  });
  console.log(`✅ Committed: ${filePath} | ${message}`);
}

// Generate AI code
async function generateCode(prompt) {
  const response = await aiClient.path("/chat/completions").post({
    body: {
      messages: [
        { role: "system", content: "You are an AI coding assistant. Write safe, functional, clean code." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      top_p: 1.0,
      model: model
    }
  });

  if (isUnexpected(response)) throw response.body.error;
  return response.body.choices[0].message.content;
}

// Log changes to a history file
async function logChange(filePath, action, message) {
  const logEntry = `${new Date().toISOString()} | ${action} | ${filePath} | ${message}\n`;
  fs.appendFileSync("ai_changes.log", logEntry);
}

// ---------------- AI Repo Manager ----------------

async function aiRepoManager(filePath, instructions) {
  const fileData = await readFile(filePath);

  let prompt = "";
  if (fileData) {
    prompt = `Modify this code according to instructions:\n${instructions}\n\nCurrent code:\n${fileData.content}`;
  } else {
    prompt = `Create a new code file with these instructions:\n${instructions}`;
  }

  const newCode = await generateCode(prompt);

  await commitFile(filePath, newCode, `AI: ${instructions}`, fileData?.sha);
  await logChange(filePath, fileData ? "update" : "create", instructions);
}

// ---------------- Scan Repo and Automate ----------------

// Get all files recursively from repo
async function listFiles(path = "") {
  const { data } = await octokit.rest.repos.getContent({
    owner: repoOwner,
    repo: repoName,
    path,
    ref: branch,
  });

  let files = [];
  for (const item of data) {
    if (item.type === "file") files.push(item.path);
    else if (item.type === "dir") {
      const subFiles = await listFiles(item.path);
      files = files.concat(subFiles);
    }
  }
  return files;
}

// Autonomous workflow
async function autoUpdateRepo() {
  const files = await listFiles();

  for (const file of files) {
    // Example instruction: AI checks for improvements or missing features
    const instructions = `Check this file for bugs, improve readability, and add missing helper functions if needed.`;
    await aiRepoManager(file, instructions);
  }

  // Example: Adding a new utility file automatically
  await aiRepoManager(
    "src/utils/autoLogger.js",
    "Create a helper function log(message) that logs timestamped messages to console."
  );
}

// ---------------- Run continuously ----------------
async function main() {
  console.log("🚀 AI Repo Bot started...");
  while (true) {
    try {
      await autoUpdateRepo();
      console.log("✅ Cycle complete. Waiting 1 hour before next check...");
      await new Promise(r => setTimeout(r, 60 * 60 * 1000)); // run every 1 hour
    } catch (err) {
      console.error("⚠️ Error in cycle:", err);
      await new Promise(r => setTimeout(r, 10 * 1000)); // wait 10 sec on error
    }
  }
}

main();
