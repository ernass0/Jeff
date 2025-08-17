import fs from "fs";
import fetch from "node-fetch";

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const COMMANDS_FILE = "AI_COMMANDS.md";
const OUTPUT_FILE = "AI_OUTPUT.md";

async function callAI(prompt) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/HuggingFaceH4/starchat2-15b-v0.1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 500, temperature: 0.7 },
        }),
      }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data[0]?.generated_text || "";
  } catch (err) {
    console.error("❌ Hugging Face API error:", err);
    return "";
  }
}

async function processCommands() {
  if (!fs.existsSync(COMMANDS_FILE)) {
    console.log(`⚠️ Commands file "${COMMANDS_FILE}" not found, skipping commands.`);
    return;
  }

  const commands = fs.readFileSync(COMMANDS_FILE, "utf8").split("\n");

  for (let line of commands) {
    line = line.trim();
    if (!line) continue;

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
}

async function generateGeneralOutput() {
  if (!fs.existsSync(COMMANDS_FILE)) return;
  const prompt = fs.readFileSync(COMMANDS_FILE, "utf8");
  const output = await callAI(prompt);
  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`📝 AI output written to ${OUTPUT_FILE}`);
}

async function main() {
  console.log("🚀 Starting Universal AI Bot...");

  await processCommands();
  await generateGeneralOutput();

  console.log("✅ Universal AI Bot finished.");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
