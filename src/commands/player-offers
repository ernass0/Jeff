// src/commands/player-offers.js
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
  name: "player-offers",
  description: "Show all offers for a specific player",
  options: [
    {
      name: "player",
      type: 3, // STRING
      description: "Player name",
      required: true,
    },
  ],

  async execute(interaction) {
    const playerName = interaction.options.getString("player");
    const config = loadConfig();
    const offers = loadOffers().filter(
      o => o.phase === config.currentPhase?.phase && o.player.toLowerCase() === playerName.toLowerCase()
    );

    if (offers.length === 0) {
      return interaction.reply(`📭 No offers found for **${playerName}** in this phase.`);
    }

    const embed = new EmbedBuilder()
      .setTitle(`📄 Offers for ${playerName}`)
      .setColor(0x00ae86)
      .setTimestamp();

    offers.forEach((o, i) => {
      embed.addFields({
        name: `${i + 1}. By: ${o.by}`,
        value: `💰 **${o.contract}**`,
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
