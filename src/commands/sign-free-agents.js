// src/commands/sign-free-agents.js
import fs from 'fs';
import path from 'path';

export default {
  name: 'sign-free-agents',
  description: 'Sign all free agents to their best respective offers based on salary, years, and options',
  async execute(interaction) {
    try {
      const filePath = path.join('data', 'league.json');
      const league = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      league.freeAgents.forEach(fa => {
        if (!fa.offers || fa.offers.length === 0) return;

        // Rank offers: higher salary first, then longer years, then options weight
        const bestOffer = fa.offers.reduce((best, current) => {
          const getScore = o => {
            let score = o.salary * 1;               // salary weight
            score += o.years * 500_000;           // years weight
            if (o.option) score += 250_000;       // option bonus
            return score;
          };
          return getScore(current) > getScore(best) ? current : best;
        });

        // Add player to the team roster
        const team = league.teams.find(t => t.name === bestOffer.team);
        if (!team) return;

        team.players.push({
          name: fa.name,
          position: fa.position,
          age: fa.age || 22,
          ratings: fa.ratings || {},
          contract: { salary: bestOffer.salary, years: bestOffer.years, type: bestOffer.option || 'standard' },
        });

        // Mark FA as signed
        fa.signed = true;
      });

      // Remove signed FAs
      league.freeAgents = league.freeAgents.filter(fa => !fa.signed);

      fs.writeFileSync(filePath, JSON.stringify(league, null, 2), 'utf8');
      await interaction.reply('✅ All free agents signed to their best offers based on salary, years, and options.');
    } catch (err) {
      console.error(err);
      await interaction.reply('❌ Failed to sign free agents.');
    }
  },
};
