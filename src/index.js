// src/index.js
import http from 'node:http';
import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// -------------------- Keep-alive HTTP server --------------------
const PORT = process.env.PORT;
if (PORT) {
  const srv = http.createServer((req, res) => {
    if (req.url === '/health') return res.end('ok');
    res.end('Jeff alive');
  });
  srv.listen(PORT, '0.0.0.0', () =>
    console.log(`Keep-alive HTTP server listening on ${PORT}`)
  );
}

// -------------------- Discord bot setup --------------------
const { DISCORD_TOKEN, BOT_NAME } = process.env;

if (!DISCORD_TOKEN) {
  console.warn('⚠️ DISCORD_TOKEN missing — bot cannot login.');
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// -------------------- Load commands --------------------
const commandsPath = path.join(process.cwd(), 'src', 'commands');
let files = [];

try {
  files = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));
} catch (err) {
  console.warn('⚠️ Commands folder missing or unreadable:', err.message);
}

for (const file of files) {
  try {
    const mod = await import(pathToFileURL(path.join(commandsPath, file)).href);
    if (mod?.data && mod?.execute) {
      client.commands.set(mod.data.name, mod);
      console.log(`✅ Loaded command: ${mod.data.name}`);
    } else {
      console.warn(`⚠️ Skipping command ${file} — missing data or execute`);
    }
  } catch (err) {
    console.error(`❌ Error importing command ${file}:`, err);
  }
}

// -------------------- Event handlers --------------------
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
  } catch (err) {
    console.error('❌ Error executing command', command.data.name, err);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: 'Error executing command.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Error executing command.', ephemeral: true });
    }
  }
});

// -------------------- Login --------------------
if (DISCORD_TOKEN) {
  client.login(DISCORD_TOKEN).catch((err) => {
    console.error('❌ Failed to login:', err);
  });
}
