import fs from "fs";
import fetch from "node-fetch";

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const commandsFile = "AI_COMMANDS.md";

async function callAI(prompt) {
  const response = await fetch("https://api-inference.huggingface.co/models/openai-community/gpt2", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: prompt })
  });

  if (!response.ok) throw new Error(`HF API error: ${response.status} ${response.statusText}`);
  const data = await response.json();
  return data[0]?.generated_text || "";
}

async function runAI() {
  try {
    const commands = fs.readFileSync(commandsFile, "utf8").split("\n");

    for (let line of commands) {
      if (line.startsWith("[create]")) {
        const file = line.split(" ")[1];
        const prompt = line.replace(`[create] ${file}`, "").trim();
        const output = await callAI(prompt);

        fs.writeFileSync(file, output);
        console.log(`✅ Created file: ${file}`);

      } else if (line.startsWith("[update]")) {
        const file = line.split(" ")[1];
        const prompt = line.replace(`[update] ${file}`, "").trim();
        const output = await callAI(prompt);

        if (fs.existsSync(file)) {
          fs.writeFileSync(file, output);
          console.log(`✅ Updated file: ${file}`);
        } else {
          console.log(`⚠️ Skipped update, file not found: ${file}`);
        }

      } else if (line.startsWith("[delete]")) {
        const file = line.split(" ")[1];
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          console.log(`🗑️ Deleted file: ${file}`);
        } else {
          console.log(`⚠️ Skipped delete, file not found: ${file}`);
        }
      }
    }

  } catch (err) {
    console.error("❌ Error in AI updater:", err);
    process.exit(0); // Don’t fail workflow
  }
}

runAI();
