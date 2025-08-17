// src/commands/sign-free-agents.js
import fs from 'fs';
import path from 'path';

export default {
  name: 'sign-free-agents',
  description: 'Sign all free agents to their best respective offers',
  async execute(interaction) {
    try {
      const filePath = path.join('data', 'league.json');
      const league = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      league.freeAgents.forEach(fa => {
        if (fa.offers.length === 0) return;

        // Find best offer by salary
        const bestOffer = fa.offers.reduce((a, b) => (a.salary > b.salary ? a : b));

        // Add player to team roster
        const team = league.teams.find(t => t.name === bestOffer.team);
        if (!team) return;

        team.players.push({
          name: fa.name,
          position: fa.position,
          age: fa.age || 22,
          ratings: fa.ratings || {},
          contract: { salary: bestOffer.salary, years: bestOffer.years, type: bestOffer.option || 'standard' },
        });

        // Remove from free agents
        fa.signed = true;
      });

      // Filter out signed FAs
      league.freeAgents = league.freeAgents.filter(fa => !fa.signed);

      fs.writeFileSync(filePath, JSON.stringify(league, null, 2), 'utf8');
      await interaction.reply('✅ All free agents signed to their best offers.');
    } catch (err) {
      console.error(err);
      await interaction.reply('❌ Failed to sign free agents.');
    }
  },
};
