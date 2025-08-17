// src/commands/my-offers.js
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
  name: "my-offers",
  description: "Show all offers you have made this FA phase",

  async execute(interaction) {
    const config = loadConfig();
    const offers = loadOffers().filter(
      o => o.phase === config.currentPhase?.phase && o.by === interaction.user.id
    );

    if (offers.length === 0) {
      return interaction.reply("📭 You haven’t made any offers in this phase.");
    }

    const embed = new EmbedBuilder()
      .setTitle(`📑 Your Offers (${config.currentPhase.phase})`)
      .setColor(0x1e90ff)
      .setTimestamp();

    offers.forEach((o, i) => {
      embed.addFields({
        name: `${i + 1}. ${o.player}`,
        value: `💰 **${o.contract}**`,
      });
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
