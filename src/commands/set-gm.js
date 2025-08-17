import { SlashCommandBuilder } from '@discordjs/builders';
import { readLeague, writeLeague } from '../lib/github.js';

export const data = new SlashCommandBuilder()
  .setName('set-gm')
  .setDescription('Assign a GM or Assistant GM to a team')
  .addStringOption(o=>o.setName('team').setDescription('Team ID (e.g., BOS)').setRequired(true))
  .addUserOption(o=>o.setName('user').setDescription('Discord user').setRequired(true))
  .addStringOption(o=>o.setName('role').setDescription('gm/assistant').setRequired(true).addChoices(
    { name: 'gm', value: 'gm' }, { name: 'assistant', value: 'assistant' }
  ));

export async function execute(interaction){
  await interaction.deferReply({ ephemeral: true });
  const teamId = interaction.options.getString('team');
  const user = interaction.options.getUser('user');
  const role = interaction.options.getString('role');
  const league = await readLeague();
  const team = league.teams.find(t=>t.id.toUpperCase()===teamId.toUpperCase());
  if(!team) return interaction.editReply('Team not found');
  if(role==='gm') team.gmUserId = user.id; else {
    team.assistantGmUserIds = Array.from(new Set([...(team.assistantGmUserIds||[]), user.id]));
  }
  await writeLeague(league, `Bot: ${role} set for ${team.id} -> ${user.tag}`);
  await interaction.editReply(`Assigned **${role}** for ${team.id}: <@${user.id}>`);
}
