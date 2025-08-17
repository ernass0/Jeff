import { SlashCommandBuilder } from '@discordjs/builders';
import { readJson } from '../lib/github.js';

export const data = new SlashCommandBuilder().setName('export').setDescription('Get the raw GitHub URL to the current league.json');

export async function execute(interaction) {
  const owner = process.env.GITHUB_OWNER; const repo = process.env.GITHUB_REPO; const path = process.env.LEAGUE_FILE_PATH;
  const league = await readJson(path);
  if (!league) return interaction.reply({ content: 'league.json not found yet. Use /load first.', ephemeral: true });
  const raw = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
  await interaction.reply({ content: `Current league file: ${raw}`, ephemeral: true });
}
