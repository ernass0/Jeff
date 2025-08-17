// src/commands/sign-free-agents.js
import fs from 'fs';
import path from 'path';
import { MessageActionRow, MessageButton } from 'discord.js';

export default {
  name: 'sign-free-agents',
  description: 'Sign all free agents, including interactive RFA matching',
  async execute(interaction) {
    try {
      const filePath = path.join('data', 'league.json');
      const league = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const channel = interaction.guild.channels.cache.find(c => c.name === 'free-agency');
      if (!channel) return interaction.reply('❌ Free agency channel not found.');

      for (const fa of league.freeAgents) {
        if (!fa.offers || fa.offers.length === 0) continue;

        // Pick best offer by scoring
        const bestOffer = fa.offers.reduce((best, current) => {
          const getScore = o => o.salary + o.years * 500_000 + (o.option ? 250_000 : 0);
          return getScore(current) > getScore(best) ? current : best;
        });

        let signedTeamName = bestOffer.team;

        // RFA logic with interactive GM matching
        if (fa.status === 'RFA' && fa.originalTeam) {
          const originalTeam = league.teams.find(t => t.name === fa.originalTeam);
          if (originalTeam) {
            // Get GM Discord ID (assumes stored in team data)
            const gmId = originalTeam.gmId;
            const gmUser = await interaction.guild.members.fetch(gmId).catch(() => null);
            if (gmUser) {
              const msg = await channel.send({
                content: `⚠️ **RFA Offer**: ${fa.name} received an offer from ${bestOffer.team} (${bestOffer.salary}$ for ${bestOffer.years} years). ${gmUser} you have 24 hours to react ✅ to match or ❌ to decline.`,
              });

              await msg.react('✅');
              await msg.react('❌');

              const filter = (reaction, user) =>
                ['✅', '❌'].includes(reaction.emoji.name) && user.id === gmId;

              const collected = await msg.awaitReactions({ filter, max: 1, time: 24 * 60 * 60 * 1000 });
              const reaction = collected.first();

              if (reaction && reaction.emoji.name === '✅') {
                signedTeamName = fa.originalTeam;
                await channel.send(`✅ ${fa.name} matched by original team ${fa.originalTeam}.`);
              } else {
                signedTeamName = bestOffer.team;
                await channel.send(`❌ ${fa.name} did not get matched and will sign with ${bestOffer.team}.`);
              }
            }
          }
        }

        // Add player to the team roster
        const team = league.teams.find(t => t.name === signedTeamName);
        if (!team) continue;

        team.players.push({
          name: fa.name,
          position: fa.position,
          age: fa.age || 22,
          ratings: fa.ratings || {},
          contract: { salary: bestOffer.salary, years: bestOffer.years, type: bestOffer.option || 'standard' },
        });

        fa.signed = true;
      }

      // Remove signed FAs
      league.freeAgents = league.freeAgents.filter(fa => !fa.signed);

      fs.writeFileSync(filePath, JSON.stringify(league, null, 2), 'utf8');
      await interaction.reply('✅ Free agents processed, including RFA interactive matching.');
    } catch (err) {
      console.error(err);
      await interaction.reply('❌ Failed to sign free agents.');
    }
  },
};
