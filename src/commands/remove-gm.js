import { SlashCommandBuilder } from '@discordjs/builders';
import { readLeague, writeLeague } from '../lib/github.js';

export const data = new SlashCommandBuilder()
  .setName('remove-gm')
  .setDescription('Remove a GM or Assistant GM from a team')
  .addStringOption(o=>o.setName('team').setDescription('Team ID').setRequired(true))
  .addUserOption(o=>o.setName('user').setDescription('User to remove').setRequired(true));

export async function execute(interaction){
  await interaction.deferReply({ ephemeral: true });
  const teamId = interaction.options.getString('team');
  const user = interaction.options.getUser('user');
  const league = await readLeague();
  const team = league.teams.find(t=>t.id.toUpperCase()===teamId.toUpperCase());
  if(!team) return interaction.editReply('Team not found');
  if(team.gmUserId===user.id) team.gmUserId = '';
  team.assistantGmUserIds = (team.assistantGmUserIds||[]).filter(id=>id!==user.id);
  await writeLeague(league, `Bot: removed GM/Assistant from ${team.id} -> ${user.tag}`);
  await interaction.editReply(`Removed GM/Assistant from ${team.id}: <@${user.id}>`);
}
