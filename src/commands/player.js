// src/commands/player.js
import { SlashCommandBuilder } from '@discordjs/builders';
import fs from 'fs';
import path from 'path';
import { readLeague } from '../lib/github.js';

export const data = new SlashCommandBuilder()
  .setName('player')
  .setDescription('Get info about a player')
  .addStringOption(option =>
    option
      .setName('player')
      .setDescription('Player name or ID')
      .setRequired(true)
  );

export async function execute(interaction) {
  try {
    const query = interaction.options.getString('player');
    let league;

    try {
      league = await readLeague(); // Try GitHub
    } catch {
      // fallback to local file
      league = JSON.parse(fs.readFileSync(path.join('data', 'league.json'), 'utf8'));
    }

    let player = league.players?.find(
      p => p.id === query || p.name.toLowerCase() === query.toLowerCase()
    );

    if (!player) {
      // If league is organized by teams
      for (const team of league.teams || []) {
        player = team.players.find(
          p => p.id === query || p.name.toLowerCase() === query.toLowerCase()
        );
        if (player) {
          player.team = team.name;
          break;
        }
      }
    }

    if (!player) return interaction.reply({ content: '❌ Player not found', ephemeral: true });

    // Compose reply string
    const ratings = player.ratings
      ? Object.entries(player.ratings).map(([k, v]) => `${k}: ${v}`).join(', ')
      : 'No ratings';

    const stats = player.stats
      ? Object.entries(player.stats).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join(', ')
      : 'No stats';

    await interaction.reply({
      content: `**${player.name}** (${player.pos || 'N/A'}) — Team: ${player.team || player.teamId || 'FA'}\nAge: ${player.age || 'N/A'}\nRatings: ${ratings}\nStats: ${stats}`,
    });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ Failed to retrieve player info.', ephemeral: true });
  }
}
