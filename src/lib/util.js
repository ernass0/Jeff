import { EmbedBuilder } from 'discord.js';

export const ok = (msg) => ({ content: `✅ ${msg}`, ephemeral: true });
export const fail = (msg) => ({ content: `❌ ${msg}`, ephemeral: true });

export function embed(title, description, fields = []) {
  return new EmbedBuilder().setTitle(title).setDescription(description).addFields(fields).setTimestamp();
}

export function nowIso() {
  return new Date().toISOString();
}

export function findTeam(league, teamId) {
  return league.teams.find((t) => t.id.toUpperCase() === teamId.toUpperCase());
}

export function findPlayer(league, q) {
  return league.players.find((p) => p.id === q || p.name.toLowerCase() === q.toLowerCase());
}
