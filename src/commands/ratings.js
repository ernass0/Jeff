// src/commands/ratings.js
import { SlashCommandBuilder } from '@discordjs/builders';
import { readLeague } from '../lib/github.js';
import fs from 'fs';
import path from 'path';

export const data = new SlashCommandBuilder()
  .setName('ratings')
  .setDescription('Show player ratings')
  .addStringOption(option =>
    option.setName('player')
      .setDescription('Player name or ID')
      .setRequired(true)
  );

export async function execute(interaction) {
  const query = interaction.options.getString('player');

  let league;
  try {
    league = await readLeague(); // Try GitHub first
  } catch (err) {
    console.warn('Failed to read league from GitHub, falling back to local file.', err);
    league = JSON.parse(fs.readFileSync(path.join('data', 'league.json'), 'utf8'));
  }

  // Search for player by ID or name
  let player = null;
  for (const team of league.teams) {
    player = team.players.find(
      p => p.id === query || p.name.toLowerCase() === query.toLowerCase()
    );
    if (player) break;
  }

  if (!player) {
    return interaction.reply({ content: '❌ Player not found', ephemeral: true });
  }

  const r = player.ratings;
  const ratingsStr = `OVR: ${r.ovr}, 3PT: ${r.three}, DEF: ${r.def}, REB: ${r.reb}, PLAY: ${r.play}`;

  await interaction.reply({ content: `**${player.name} Ratings:** ${ratingsStr}` });
}
