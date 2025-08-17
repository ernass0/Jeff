import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const { DISCORD_TOKEN, BOT_NAME } = process.env;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load commands dynamically
const commandsPath = path.join(process.cwd(), 'src', 'commands');
const files = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));
for (const file of files) {
  const mod = await import(path.join(commandsPath, file));
  if (mod?.data && mod?.execute) client.commands.set(mod.data.name, mod);
}

client.once(Events.ClientReady, (c) => {
  console.log(`${BOT_NAME || 'Jeff'} is ready as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply({ content: 'Command not found.', ephemeral: true });
    return;
  }
  try {
    await command.execute(interaction, client);
  } catch (e) {
    console.error(e);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: 'Error executing command.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Error executing command.', ephemeral: true });
    }
  }
});

if (!DISCORD_TOKEN) {
  console.warn('DISCORD_TOKEN missing — bot cannot login (OK for GitHub‑only setup).');
} else {
  client.login(DISCORD_TOKEN);
}
