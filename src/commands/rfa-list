// src/commands/rfa-list.js
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
  name: "rfa-list",
  description: "Show all RFA signings (current RFA phase)",

  async execute(interaction) {
    const config = loadConfig();
    const rfas = loadRFA().filter(o => o.phase === config.currentPhase?.phase);

    if (rfas.length === 0) {
      return interaction.reply("📭 No RFA signings have been made in this phase yet.");
    }

    const embed = new EmbedBuilder()
      .setTitle(`📝 RFA Signings (${config.currentPhase.phase})`)
      .setColor(0xffc107)
      .setTimestamp();

    rfas.slice(0, 15).forEach((r, i) => {
      embed.addFields({
        name: `${i + 1}. ${r.player}`,
        value: `💰 **${r.contract}**\n✍️ Signed by: ${r.by}`,
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
