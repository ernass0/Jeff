// src/commands/roster.js
import { SlashCommandBuilder } from '@discordjs/builders';
import { readLeague } from '../lib/github.js';

export const data = new SlashCommandBuilder()
  .setName('roster')
  .setDescription('Show a team roster')
  .addStringOption(option =>
    option.setName('team')
          .setDescription('Team ID or name')
          .setRequired(true)
  );

export async function execute(interaction) {
  try {
    const teamInput = interaction.options.getString('team');
    
    // Read the league data from GitHub
    const league = await readLeague();

    // Try finding team by ID first, then by name (case-insensitive)
    let team = league.teams.find(t => t.id.toUpperCase() === teamInput.toUpperCase());
    if (!team) {
      team = league.teams.find(t => t.name.toLowerCase() === teamInput.toLowerCase());
    }

    if (!team) return interaction.reply({ content: '❌ Team not found', ephemeral: true });

    // Map roster player IDs to player names
    const rosterList = team.roster
      .map(pid => league.players.find(p => p.id === pid)?.name || pid)
      .join('\n• ');

    await interaction.reply({
      content: `**${team.name}** roster:\n• ${rosterList}`,
      ephemeral: false,
    });

  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ Failed to retrieve roster.', ephemeral: true });
  }
}
