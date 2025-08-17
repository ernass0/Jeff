// src/commands/fa.js
import fs from "fs";
import path from "path";

const configPath = path.join("data", "fa-config.json");
const ownerId = "YOUR_DISCORD_ID"; // change this!

function loadConfig() {
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
  return {
    channels: {},
    currentPhase: null,
  };
}

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
}

export default {
  name: "fa",
  description: "Owner-only Free Agency system",
  options: [
    {
      name: "set-channel",
      type: 1,
      description: "Set a channel (owner only)",
      options: [
        {
          name: "type",
          type: 3,
          required: true,
          choices: [
            { name: "FA Offers", value: "offers" },
            { name: "Announcements", value: "announcements" },
            { name: "RFA", value: "rfa" },
          ],
        },
        { name: "channel", type: 7, required: true, description: "Select the channel" },
      ],
    },
    {
      name: "start-phase",
      type: 1,
      description: "Start a Free Agency phase (owner only)",
      options: [
        {
          name: "phase",
          type: 3,
          required: true,
          choices: [
            { name: "Phase 1", value: "phase1" },
            { name: "RFA 1", value: "rfa1" },
            { name: "Phase 2", value: "phase2" },
            { name: "RFA 2", value: "rfa2" },
            { name: "Phase 3", value: "phase3" },
            { name: "RFA 3", value: "rfa3" },
          ],
        },
        {
          name: "duration",
          type: 4,
          required: true,
          description: "Duration in 6-hour increments (1 = 6h, 2 = 12h, 3 = 18h, 4 = 24h)",
        },
      ],
    },
    {
      name: "end-phase",
      type: 1,
      description: "End current FA phase manually (owner only)",
    },
    {
      name: "status",
      type: 1,
      description: "Show current FA phase & time left",
    },
  ],

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    let config = loadConfig();

    // owner-only protection
    if (interaction.user.id !== ownerId && sub !== "status") {
      return interaction.reply({ content: "❌ Only the owner can use this.", ephemeral: true });
    }

    if (sub === "set-channel") {
      const type = interaction.options.getString("type");
      const channel = interaction.options.getChannel("channel");

      config.channels[type] = channel.id;
      saveConfig(config);

      return interaction.reply(`✅ Set **${type}** channel to ${channel}`);
    }

    if (sub === "start-phase") {
      const phase = interaction.options.getString("phase");
      const duration = interaction.options.getInteger("duration");

      if (duration < 1 || duration > 4) {
        return interaction.reply("❌ Duration must be 1–4 (6–24 hours).");
      }

      const durationMs = duration * 6 * 60 * 60 * 1000;
      const endAt = Date.now() + durationMs;

      config.currentPhase = { phase, startedAt: Date.now(), endAt };
      saveConfig(config);

      const ann = config.channels.announcements
        ? interaction.guild.channels.cache.get(config.channels.announcements)
        : null;
      if (ann) {
        ann.send(`🚀 **${phase.toUpperCase()}** has started!\n⏳ Duration: ${duration * 6} hours.`);
      }

      // Auto end
      setTimeout(() => {
        let updated = loadConfig();
        if (updated.currentPhase && updated.currentPhase.phase === phase) {
          updated.currentPhase = null;
          saveConfig(updated);
          if (ann) ann.send(`⏰ **${phase.toUpperCase()}** has ended!`);
        }
      }, durationMs);

      return interaction.reply(`✅ Started **${phase}** for ${duration * 6} hours.`);
    }

    if (sub === "end-phase") {
      if (!config.currentPhase) {
        return interaction.reply("❌ No active phase to end.");
      }
      const phase = config.currentPhase.phase;
      config.currentPhase = null;
      saveConfig(config);

      const ann = config.channels.announcements
        ? interaction.guild.channels.cache.get(config.channels.announcements)
        : null;
      if (ann) ann.send(`⏹️ **${phase.toUpperCase()}** ended manually by owner.`);

      return interaction.reply(`✅ Ended **${phase}**.`);
    }

    if (sub === "status") {
      if (!config.currentPhase) {
        return interaction.reply("📭 No active Free Agency phase.");
      }
      const { phase, endAt } = config.currentPhase;
      const timeLeftMs = endAt - Date.now();
      const hours = Math.max(0, Math.floor(timeLeftMs / (1000 * 60 * 60)));
      const minutes = Math.max(0, Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60)));

      return interaction.reply(`📊 Current Phase: **${phase.toUpperCase()}**\n⏳ Time left: ${hours}h ${minutes}m`);
    }
  },
};
