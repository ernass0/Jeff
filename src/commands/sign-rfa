// src/commands/sign-rfa.js
import fs from "fs";
import path from "path";

const rfaPath = path.join("data", "rfa-signings.json");
function loadRFA() {
  if (fs.existsSync(rfaPath)) return JSON.parse(fs.readFileSync(rfaPath, "utf8"));
  return [];
}
function saveRFA(data) {
  fs.writeFileSync(rfaPath, JSON.stringify(data, null, 2), "utf8");
}

import { loadConfig } from "../utils/faConfig.js";

export default {
  name: "sign-rfa",
  description: "Sign a player during RFA phase",
  options: [
    { name: "player", type: 3, required: true, description: "RFA player you are signing" },
    { name: "contract", type: 3, required: true, description: "Contract details" },
  ],

  async execute(interaction) {
    const config = loadConfig();

    if (!config.currentPhase || !config.currentPhase.phase.startsWith("rfa")) {
      return interaction.reply({ content: "❌ RFA signings can only be done during **RFA phases**.", ephemeral: true });
    }

    const player = interaction.options.getString("player");
    const contract = interaction.options.getString("contract");
    const user = interaction.user;

    // Save RFA signing
    const rfaData = loadRFA();
    rfaData.push({
      player,
      contract,
      by: user.tag,
      userId: user.id,
      phase: config.currentPhase.phase,
      timestamp: Date.now(),
    });
    saveRFA(rfaData);

    // Post in RFA channel
    const channelId = config.channels.rfa;
    if (channelId) {
      const ch = interaction.guild.channels.cache.get(channelId);
      if (ch) {
        ch.send(`📝 **RFA Signing**\n👤 Player: **${player}**\n💰 Contract: **${contract}**\n✍️ Signed by: ${user}`);
      }
    }

    return interaction.reply(`✅ You signed **${player}** to contract **${contract}**.`);
  },
};
