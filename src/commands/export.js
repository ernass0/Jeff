// src/commands/export.js
import { SlashCommandBuilder } from '@discordjs/builders';
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { GITHUB_OWNER, GITHUB_REPO, LEAGUE_FILE_PATH, GH_TOKEN } from '../lib/util.js';

export const data = new SlashCommandBuilder()
  .setName('export')
  .setDescription('Export the updated league file to GitHub and get the raw URL');

export async function execute(interaction) {
  try {
    const octokit = new Octokit({ auth: GH_TOKEN });
    const filePath = path.join('data', 'league.json');

    if (!fs.existsSync(filePath)) {
      return interaction.reply({
        content: 'league.json not found yet. Use /load first.',
        ephemeral: true,
      });
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Get current file SHA from GitHub
    const { data: fileData } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: LEAGUE_FILE_PATH,
    });

    // Update league.json on GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: LEAGUE_FILE_PATH,
      message: 'Bot: Updated league file',
      content: Buffer.from(content).toString('base64'),
      sha: fileData.sha,
    });

    // Provide raw URL for the updated file
    const rawURL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${LEAGUE_FILE_PATH}`;
    await interaction.reply({
      content: `✅ League file exported to GitHub!\nRaw URL: ${rawURL}`,
      ephemeral: true,
    });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ Failed to export league file.', ephemeral: true });
  }
}
