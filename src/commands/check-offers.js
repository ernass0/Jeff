// src/commands/check-offers.js
import fs from 'fs';
import path from 'path';

export default {
  name: 'check-offers',
  description: 'Check all offers for a free agent',
  options: [{ name: 'player', type: 3, description: 'Player name', required: true }],
  async execute(interaction) {
    try {
      const playerName = interaction.options.getString('player');
      const league = JSON.parse(fs.readFileSync(path.join('data', 'league.json'), 'utf8'));

      const fa = league.freeAgents.find(f => f.name.toLowerCase() === playerName.toLowerCase());
      if (!fa) return interaction.reply('❌ Free Agent not found.');

      if (fa.offers.length === 0) return interaction.reply(`No offers for ${fa.name} yet.`);

      const offersList = fa.offers.map(o => `${o.team}: $${o.salary} x${o.years} ${o.option ? `(${o.option})` : ''}`).join('\n');
      await interaction.reply(`**Offers for ${fa.name}:**\n${offersList}`);
    } catch (err) {
      console.error(err);
      await interaction.reply('❌ Failed to retrieve offers.');
    }
  },
};
