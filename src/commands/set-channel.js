import { SlashCommandBuilder } from '@discordjs/builders';
import { readChannels, writeChannels } from '../lib/github.js';

export const data = new SlashCommandBuilder()
  .setName('set-channel')
  .setDescription('Map a feature to a channel')
  .addStringOption(o => o.setName('feature').setDescription('news/offers/releases/renouncing/signings/standings/trades').setRequired(true))
  .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const feature = interaction.options.getString('feature');
  const channel = interaction.options.getChannel('channel');
  const channels = (await readChannels()) || {};
  channels[feature] = channel.id;
  await writeChannels(channels, `Bot: set channel mapping for ${feature} -> ${channel.id}`);
  await interaction.editReply(`Set **${feature}** channel to <#${channel.id}>`);
}
