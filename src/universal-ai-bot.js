import fs from "fs";
import fetch from "node-fetch";

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const MODEL = "HuggingFaceH4/starchat2-15b-v0.1";
const COMMANDS_FILE = "AI_COMMANDS.md";

async function callAI(prompt) {
  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 500 } }),
    });

    const text = await res.text(); // read raw text first
    try {
      const data = JSON.parse(text);
      if (data.error) {
        console.error("❌ Hugging Face API error:", data.error);
        return "";
      }
      return data[0]?.generated_text || "";
    } catch {
      console.error("❌ Hugging Face API returned invalid JSON:", text);
      return "";
    }

  } catch (err) {
    console.error("❌ Fetch error:", err);
    return "";
  }
}

async function processCommands() {
  if (!fs.existsSync(COMMANDS_FILE)) {
    console.error(`❌ Commands file not found: ${COMMANDS_FILE}`);
    return;
  }

  const commands = fs.readFileSync(COMMANDS_FILE, "utf8").split("\n");

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
      if (!fs.existsSync(file)) {
        console.log(`⚠️ Skipped update, file not found: ${file}`);
        continue;
      }
      const output = await callAI(prompt);
      fs.writeFileSync(file, output);
      console.log(`✅ Updated file: ${file}`);

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
  const prompt = fs.existsSync(COMMANDS_FILE) ? fs.readFileSync(COMMANDS_FILE, "utf8") : "";
  const output = await callAI(prompt);
  fs.writeFileSync("AI_OUTPUT.md", output);
  console.log("📝 AI output written to AI_OUTPUT.md");
}

async function main() {
  console.log("🚀 Starting Universal AI Bot...");
  await processCommands();
  await generateGeneralOutput();
  console.log("✅ Universal AI Bot finished.");
}

main();  console.log("🚀 Starting Universal AI Bot...");

  await processCommands();
  await generateGeneralOutput();

  console.log("✅ Universal AI Bot finished.");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
