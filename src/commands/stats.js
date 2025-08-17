import { SlashCommandBuilder } from '@discordjs/builders';
import { readLeague } from '../lib/github.js';

export const data = new SlashCommandBuilder().setName('stats').setDescription('Player stats').addStringOption(o=>o.setName('player').setDescription('Name or ID').setRequired(true));

export async function execute(interaction){
  const q = interaction.options.getString('player');
  const league = await readLeague();
  const p = league.players.find(pl=>pl.id===q || pl.name.toLowerCase()===q.toLowerCase());
  if(!p) return interaction.reply({ content: 'Player not found', ephemeral: true });
  const s=p.stats; await interaction.reply({ content: `${p.name} stats — PPG ${s.ppg}, APG ${s.apg}, RPG ${s.rpg}, SPG ${s.spg}, BPG ${s.bpg}` });
}
