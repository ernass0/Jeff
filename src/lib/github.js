import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';
import { nowIso } from './util.js';

dotenv.config();
const { GH_TOKEN, GITHUB_OWNER, GITHUB_REPO, LEAGUE_FILE_PATH = 'data/league.json', CHANNELS_FILE_PATH = 'data/channels.json' } = process.env;

export const octokit = GH_TOKEN ? new Octokit({ auth: GH_TOKEN }) : null;

async function getFileSha(path) {
  try {
    const { data } = await octokit.rest.repos.getContent({ owner: GITHUB_OWNER, repo: GITHUB_REPO, path });
    return Array.isArray(data) ? null : data.sha;
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

export async function readJson(path) {
  if (!octokit) throw new Error('GH_TOKEN not configured');
  try {
    const { data } = await octokit.rest.repos.getContent({ owner: GITHUB_OWNER, repo: GITHUB_REPO, path });
    const content = Buffer.from(data.content, data.encoding).toString('utf8');
    return JSON.parse(content);
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

export async function writeJson(path, obj, message) {
  if (!octokit) throw new Error('GH_TOKEN not configured');
  const sha = await getFileSha(path);
  const updated = { ...obj };
  if (updated.meta) updated.meta.updated = nowIso();
  const content = Buffer.from(JSON.stringify(updated, null, 2)).toString('base64');
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path,
    message,
    content,
    sha: sha || undefined
  });
}

export async function ensureFile(path, fallbackObj, message) {
  const existing = await readJson(path);
  if (existing) return existing;
  await writeJson(path, fallbackObj, message);
  return fallbackObj;
}

export async function readLeague() {
  return readJson(LEAGUE_FILE_PATH);
}

export async function writeLeague(league, message) {
  return writeJson(LEAGUE_FILE_PATH, league, message);
}

export async function readChannels() {
  return readJson(CHANNELS_FILE_PATH);
}

export async function writeChannels(channels, message) {
  return writeJson(CHANNELS_FILE_PATH, channels, message);
}
