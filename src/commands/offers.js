// src/commands/offers.js
import fs from "fs";
import path from "path";
import { EmbedBuilder } from "discord.js";
import { loadConfig } from "../utils/faConfig.js";

const offersPath = path.join("data", "offers.json");
function loadOffers() {
  if (fs.existsSync(offersPath)) return JSON.parse(fs.readFileSync(offersPath, "utf8"));
  return [];
}

export default {
  name: "offers",
  description: "Show all free agency offers (current phase)",

  async execute(interaction) {
    const config = loadConfig();
    const offers = loadOffers().filter(o => o.phase === config.currentPhase?.phase);

    if (offers.length === 0) {
      return interaction.reply("📭 No offers have been made in this phase yet.");
    }

    const embed = new EmbedBuilder()
      .setTitle(`📄 Free Agency Offers (${config.currentPhase.phase})`)
      .setColor(0x00ae86)
      .setTimestamp();

    offers.slice(0, 15).forEach((o, i) => {
      embed.addFields({
        name: `${i + 1}. ${o.player}`,
        value: `💰 **${o.contract}**\n👤 By: ${o.by}`,
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
