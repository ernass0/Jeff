// src/commands/my-rfa.js
import fs from "fs";
import path from "path";
import { EmbedBuilder } from "discord.js";
import { loadConfig } from "../utils/faConfig.js";

const rfaPath = path.join("data", "rfa-signings.json");
function loadRFA() {
  if (fs.existsSync(rfaPath)) return JSON.parse(fs.readFileSync(rfaPath, "utf8"));
  return [];
}

export default {
  name: "my-rfa",
  description: "Show all your team’s RFAs this phase",

  async execute(interaction) {
    const config = loadConfig();
    const rfas = loadRFA().filter(r => r.phase === config.currentPhase?.phase && r.teamId === interaction.user.id);

    if (rfas.length === 0) {
      return interaction.reply("📭 Your team has no RFAs this phase.");
    }

    const embed = new EmbedBuilder()
      .setTitle(`📝 Your RFAs (${config.currentPhase.phase})`)
      .setColor(0xffa500)
      .setTimestamp();

    rfas.forEach((r, i) => {
      embed.addFields({
        name: `${i + 1}. ${r.player}`,
        value: `💰 Best Offer: **${r.contract}**`,
      });
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
