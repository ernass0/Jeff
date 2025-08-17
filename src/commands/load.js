import { SlashCommandBuilder } from '@discordjs/builders';
import { ensureFile, writeLeague, readJson } from '../lib/github.js';

export const data = new SlashCommandBuilder()
  .setName('load')
  .setDescription('Load a league JSON by URL into the repo (overwrites data/league.json).')
  .addStringOption(o => o.setName('url').setDescription('Raw JSON URL').setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const url = interaction.options.getString('url');
  if (!url) {
    // ensure from sample
    const sample = await readJson('data/league.sample.json');
    await ensureFile('data/league.json', sample, 'Bot: initialize league.json from sample');
    await interaction.editReply('Initialized `data/league.json` from sample.');
    return;
  }
  try {
    const res = await fetch(url);
    const json = await res.json();
    await writeLeague(json, `Bot: Loaded league from URL by ${interaction.user.tag}`);
    await interaction.editReply('League loaded from URL and committed to repo.');
  } catch (e) {
    await interaction.editReply('Failed to fetch/parse the provided URL. Make sure it is raw JSON.');
  }
}
