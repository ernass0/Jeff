// src/commands/offer.js
import fs from 'fs';
import path from 'path';

export default {
  name: 'offer',
  description: 'Send an offer to a free agent',
  options: [
    { name: 'player', type: 3, description: 'Player name', required: true },
    { name: 'team', type: 3, description: 'Your team name', required: true },
    { name: 'salary', type: 10, description: 'Offer salary', required: true },
    { name: 'years', type: 4, description: 'Contract length', required: true },
    { name: 'option', type: 3, description: 'Contract option', required: false },
  ],
  async execute(interaction) {
    try {
      const { player: playerName, team, salary, years, option } = Object.fromEntries(interaction.options.data.map(o => [o.name, o.value]));
      const filePath = path.join('data', 'league.json');
      const league = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const fa = league.freeAgents.find(f => f.name.toLowerCase() === playerName.toLowerCase());
      if (!fa) return interaction.reply('❌ Free Agent not found.');

      // Optional: check team's cap space
      const teamObj = league.teams.find(t => t.name.toLowerCase() === team.toLowerCase());
      if (!teamObj) return interaction.reply('❌ Team not found.');
      const totalCapUsed = teamObj.players.reduce((a, p) => a + p.contract.salary, 0);
      if (totalCapUsed + salary > teamObj.cap) return interaction.reply('❌ Not enough cap space for this offer.');

      // Save offer
      fa.offers.push({ team, salary, years, option: option || null });
      fs.writeFileSync(filePath, JSON.stringify(league, null, 2), 'utf8');

      await interaction.reply(`✅ Offer submitted to ${fa.name} by ${team}: $${salary} x${years} years${option ? ` (${option})` : ''}`);
    } catch (err) {
      console.error(err);
      await interaction.reply('❌ Failed to submit offer.');
    }
  },
};
