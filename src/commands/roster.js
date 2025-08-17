import { SlashCommandBuilder } from '@discordjs/builders';
import { readLeague } from '../lib/github.js';

export const data = new SlashCommandBuilder().setName('roster').setDescription('Team roster').addStringOption(o=>o.setName('team').setDescription('Team ID').setRequired(true));

export async function execute(interaction){
  const teamId = interaction.options.getString('team');
  const league = await readLeague();
  const team = league.teams.find(t=>t.id.toUpperCase()===teamId.toUpperCase());
  if(!team) return interaction.reply({ content: 'Team not found', ephemeral: true });
  const names = team.roster.map(pid=>league.players.find(p=>p.id===pid)?.name||pid);
  await interaction.reply({ content: `**${team.name}** roster:\n• ${names.join('\n• ')}`, ephemeral: false });
}
