// src/commands/load.js
import { SlashCommandBuilder } from '@discordjs/builders';
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { GITHUB_OWNER, GITHUB_REPO, LEAGUE_FILE_PATH, GH_TOKEN } from '../lib/util.js';
import fetch from 'node-fetch'; // if using Node < 18, otherwise native fetch works

export const data = new SlashCommandBuilder()
  .setName('load')
  .setDescription('Load a league JSON from GitHub or URL into the repo.')
  .addStringOption(o =>
    o.setName('url')
      .setDescription('Optional: raw JSON URL to load from')
      .setRequired(false)
  );

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const url = interaction.options.getString('url');

  try {
    let leagueJson;

    if (url) {
      // Load from external URL
      const res = await fetch(url);
      leagueJson = await res.json();
    } else {
      // Load from GitHub
      const octokit = new Octokit({ auth: GH_TOKEN });
      const { data } = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: LEAGUE_FILE_PATH,
      });

      const content = Buffer.from(data.content, 'base64').toString('utf8');
      leagueJson = JSON.parse(content);
    }

    // Write locally
    const filePath = path.join('data', 'league.json');
    fs.writeFileSync(filePath, JSON.stringify(leagueJson, null, 2), 'utf8');

    // Commit to GitHub
    const octokit = new Octokit({ auth: GH_TOKEN });
    const { data: existingFile } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: LEAGUE_FILE_PATH,
    });

    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: LEAGUE_FILE_PATH,
      message: `Bot: Loaded league ${url ? 'from URL' : 'from GitHub'} by ${interaction.user.tag}`,
      content: Buffer.from(JSON.stringify(leagueJson, null, 2)).toString('base64'),
      sha: existingFile.sha,
    });

    await interaction.editReply(`✅ League successfully loaded ${url ? 'from URL' : 'from GitHub'}.`);
  } catch (err) {
    console.error(err);
    await interaction.editReply('❌ Failed to load league. Make sure the URL is raw JSON or GitHub repo is accessible.');
  }
}
