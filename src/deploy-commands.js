import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import fs from 'node:fs';
import path from 'node:path';

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;

async function collectCommands() {
  const commandsPath = path.join(process.cwd(), 'src', 'commands');
  const files = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));
  const data = [];
  for (const file of files) {
    const mod = await import(path.join(commandsPath, file));
    if (mod?.data) data.push(mod.data.toJSON());
  }
  return data;
}

async function main() {
  if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
    console.log('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID — skip deploy');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  const body = await collectCommands();

  try {
    if (DISCORD_GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
        { body }
      );
      console.log(`✅ Registered ${body.length} guild commands.`);
    } else {
      await rest.put(
        Routes.applicationCommands(DISCORD_CLIENT_ID),
        { body }
      );
      console.log(`✅ Registered ${body.length} global commands.`);
    }
  } catch (error) {
    console.error('❌ Failed to deploy commands:', error);
    process.exit(1);
  }
}

main();
