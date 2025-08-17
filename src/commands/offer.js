// src/commands/offer.js
import fs from "fs";
import path from "path";

const offersPath = path.join("data", "offers.json");
function loadOffers() {
  if (fs.existsSync(offersPath)) return JSON.parse(fs.readFileSync(offersPath, "utf8"));
  return [];
}
function saveOffers(offers) {
  fs.writeFileSync(offersPath, JSON.stringify(offers, null, 2), "utf8");
}

import { loadConfig } from "../utils/faConfig.js"; // reuse config loader from fa.js

export default {
  name: "offer",
  description: "Submit a free agency offer (only during FA phases)",
  options: [
    { name: "player", type: 3, required: true, description: "Player you want to offer to" },
    { name: "contract", type: 3, required: true, description: "Contract details (e.g. 2y / 20M)" },
  ],

  async execute(interaction) {
    const config = loadConfig();

    if (!config.currentPhase || !config.currentPhase.phase.startsWith("phase")) {
      return interaction.reply({ content: "❌ Offers can only be made during **FA phases**.", ephemeral: true });
    }

    const player = interaction.options.getString("player");
    const contract = interaction.options.getString("contract");
    const user = interaction.user;

    // Save offer
    const offers = loadOffers();
    offers.push({
      player,
      contract,
      by: user.tag,
      userId: user.id,
      phase: config.currentPhase.phase,
      timestamp: Date.now(),
    });
    saveOffers(offers);

    // Post in FA Offers channel
    const channelId = config.channels.offers;
    if (channelId) {
      const ch = interaction.guild.channels.cache.get(channelId);
      if (ch) {
        ch.send(`📄 **Offer Submitted**\n👤 Player: **${player}**\n💰 Contract: **${contract}**\n📨 By: ${user}`);
      }
    }

    return interaction.reply(`✅ Your offer for **${player}** (${contract}) has been submitted.`);
  },
};
