// src/commands/sign-free-agents.js
import fs from 'fs';
import path from 'path';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export default {
  name: 'sign-free-agents',
  description: 'Sign all free agents with bulk interactive RFA matching using buttons',
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

        // RFA interactive logic
        if (fa.status === 'RFA' && fa.originalTeam) {
          const originalTeam = league.teams.find(t => t.name === fa.originalTeam);
          if (originalTeam && originalTeam.gmId) {
            const gmId = originalTeam.gmId;
            const gmUser = await interaction.guild.members.fetch(gmId).catch(() => null);

            if (gmUser) {
              const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`match_${fa.name}`).setLabel('✅ Match Offer').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`decline_${fa.name}`).setLabel('❌ Decline Offer').setStyle(ButtonStyle.Danger)
              );

              const msg = await channel.send({
                content: `⚠️ **RFA Offer**: ${fa.name} received an offer from ${bestOffer.team} (${bestOffer.salary}$ for ${bestOffer.years} years). ${gmUser} you have 24 hours to choose:`,
                components: [row],
              });

              // Button collector for 24h
              const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 24 * 60 * 60 * 1000,
                filter: i => i.user.id === gmId,
              });

              collector.on('collect', async i => {
                if (i.customId.startsWith('match_')) {
                  signedTeamName = fa.originalTeam;
                  await i.update({ content: `✅ ${fa.name} matched by original team ${fa.originalTeam}.`, components: [] });
                } else if (i.customId.startsWith('decline_')) {
                  signedTeamName = bestOffer.team;
                  await i.update({ content: `❌ ${fa.name} did not get matched and will sign with ${bestOffer.team}.`, components: [] });
                }
              });

              // On collector end (timeout)
              collector.on('end', async collected => {
                if (collected.size === 0) signedTeamName = bestOffer.team;
              });
            }
          }
        }

        // Add player to the chosen team
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
      await interaction.reply('✅ Free agents processed, all RFA offers sent for interactive matching.');
    } catch (err) {
      console.error(err);
      await interaction.reply('❌ Failed to sign free agents.');
    }
  },
};
