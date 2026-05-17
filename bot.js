// ============================================================
// OGS BOT - FIXED PERSONALITY ENGINE VERSION
// ============================================================

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType
} = require('discord.js');

const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ============================================================
// CONFIG
// ============================================================

const PREFIX = '!';
const WELCOME_CHANNEL_NAME = 'welcome';
const AUTO_ROLE_NAME = 'Member';
const BUMP_CHANNEL_NAME = 'server-bump';

// ============================================================
// OWNER CONFIG
// ============================================================

const OWNER_ID = '613760928671989762';

const OWNER_VALO_NAMES = [
  'necksa',
  'lsdxnecksa'
];

// ============================================================
// MEMORY + STATS
// ============================================================

const memory = new Map();
const stats = {};

// ============================================================
// DATA
// ============================================================

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything 😭",
  "Why did the scarecrow win an award? He was outstanding in his field 🌾"
];

const eightBallResponses = [
  'Yes',
  'No',
  'Maybe',
  'Definitely',
  'Not happening'
];

const valoPersonalities = [
  "Entry fragger. Runs in and dies first 😭",
  "Baiter. Lets team die then gets kills 💀",
  "Support player. Actually useful for once",
  "Instalock duelist. No aim, only confidence",
  "Rank grinder. Plays like life depends on it"
];

const valoFallbacks = [
  "Probably a ranked demon 😤",
  "Definitely bottom frag 😭",
  "Hardstuck but blames team 💀",
  "Aim good, brain missing",
  "Instalock duelist energy"
];

const roasts = [
  "bro plays like WiFi on 1 bar 💀",
  "you’re not useless, you’re just limited edition",
  "even NPCs have better decision making",
  "you don’t lose, you donate wins 😭",
  "your aim is just vibes at this point"
];

// ============================================================
// READY
// ============================================================

client.once('ready', () => {

  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log('🔥 OGS BOT ONLINE');

  client.user.setActivity('watching the chaos 😭');

  setInterval(() => {

    client.guilds.cache.forEach(guild => {

      const channel = guild.channels.cache.find(
        c => c.name === BUMP_CHANNEL_NAME
      );

      if (!channel) return;

      channel.send('⏰ Time to bump the server with `/bump` 😎');

    });

  }, 1000 * 60 * 60 * 2);

});

// ============================================================
// WELCOME SYSTEM
// ============================================================

client.on('guildMemberAdd', async (member) => {

  try {

    const role = member.guild.roles.cache.find(
      r => r.name === AUTO_ROLE_NAME
    );

    if (role) {
      await member.roles.add(role);
    }

  } catch {}

  const channel = member.guild.channels.cache.find(
    c => c.name === WELCOME_CHANNEL_NAME
  );

  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(`👋 Welcome to ${member.guild.name}!`)
    .setDescription(`Hey ${member}, welcome to the chaos 😭`)
    .setColor(0x5865F2);

  channel.send({ embeds: [embed] });

});

// ============================================================
// PASSIVE CHAT SYSTEM
// ============================================================

let lastPassiveReply = 0;

const PASSIVE_COOLDOWN = 5000;

// ============================================================
// MAIN MESSAGE EVENT
// ============================================================

client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  const now = Date.now();

  const passiveAllowed =
    now - lastPassiveReply > PASSIVE_COOLDOWN;

  const shouldPassiveReply =
    passiveAllowed &&
    Math.random() < 0.08;

  const userId = message.author.id;
  const msg = message.content.toLowerCase();

  // ============================================================
  // STATS
  // ============================================================

  if (!stats[userId]) {
    stats[userId] = { messages: 0 };
  }

  stats[userId].messages++;

  // ============================================================
  // COMMANDS
  // ============================================================

  if (message.content.startsWith(PREFIX)) {

    const args = message.content
      .slice(PREFIX.length)
      .trim()
      .split(/ +/);

    const command = args.shift().toLowerCase();

    // HELP

    if (command === 'help') {

      return message.reply(`
Commands:
!help
!joke
!8ball
!stats
!valo
!roast
!ticketpanel
      `);
    }

    // JOKE

    if (command === 'joke') {

      return message.reply(
        jokes[Math.floor(Math.random() * jokes.length)]
      );
    }

    // 8BALL

    if (command === '8ball') {

      return message.reply(
        eightBallResponses[
          Math.floor(Math.random() * eightBallResponses.length)
        ]
      );
    }

    // STATS

    if (command === 'stats') {

      const sorted = Object.entries(stats)
        .sort((a, b) => b[1].messages - a[1].messages);

      if (!sorted.length) {
        return message.reply('No data yet.');
      }

      const topUser = sorted[0];

      return message.reply(
        `📊 Top chatter: <@${topUser[0]}> with ${topUser[1].messages} messages`
      );
    }

    // ROAST

    if (command === 'roast') {

      const target = message.mentions.users.first();

      if (!target) {
        return message.reply('Tag someone to roast 😭');
      }

      if (target.id === OWNER_ID) {
        return message.reply('nah 😭 that’s my creator');
      }

      const roast =
        roasts[Math.floor(Math.random() * roasts.length)];

      return message.reply(`${target}, ${roast}`);
    }

    // VALO

    if (command === 'valo') {

      const input = args[0];

      if (!input || !input.includes('#')) {
        return message.reply('Use: !valo username#tag');
      }

      let [name, tag] = input.split('#');

      name = name.toLowerCase();
      tag = tag.toLowerCase();

      if (OWNER_VALO_NAMES.includes(name)) {

        return message.reply(`
🎮 ${name}#${tag}

Playstyle:
best player alive 😭
`);
      }

      try {

        const res = await axios.get(
          `https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`
        );

        const player = res.data.data;

        const personality =
          valoPersonalities[
            Math.floor(Math.random() * valoPersonalities.length)
          ];

        return message.reply(`
🎮 ${player.name}#${player.tag}

Playstyle:
${personality}
        `);

      } catch {

        const fallback =
          valoFallbacks[
            Math.floor(Math.random() * valoFallbacks.length)
          ];

        return message.reply(`
🎮 ${name}#${tag}

(API couldn't verify)

Playstyle:
${fallback}
        `);
      }
    }

    // ============================================================
    // TICKET PANEL
    // ============================================================

    if (command === 'ticketpanel') {

      const embed = new EmbedBuilder()
        .setTitle('🎫 Brawlers Support')
        .setDescription(
          'Click the button below to create a support ticket.\n\n' +
          '• Tournament Support\n' +
          '• Prize Claims\n' +
          '• Player Reports\n' +
          '• Partnerships'
        )
        .setColor(0x5865F2);

      const row = new ActionRowBuilder()
        .addComponents(

          new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('Create Ticket')
            .setEmoji('🎫')
            .setStyle(ButtonStyle.Primary)

        );

      return message.channel.send({
        embeds: [embed],
        components: [row]
      });
    }
  }

  // ============================================================
  // PASSIVE REPLIES
  // ============================================================

  if (
    shouldPassiveReply &&
    !message.mentions.has(client.user)
  ) {

    if (
      msg.includes('rr') ||
      msg.includes('valo') ||
      msg.includes('ranked')
    ) {

      const replies = [
        'ranked was invented by demons 😭',
        'someone losing mental today',
        'RR disappearing incident'
      ];

      lastPassiveReply = now;

      return message.reply(
        replies[Math.floor(Math.random() * replies.length)]
      );
    }
  }

});

// ============================================================
// TICKET SYSTEM
// ============================================================

client.on('interactionCreate', async (interaction) => {

  if (!interaction.isButton()) return;

  // CREATE TICKET

  if (interaction.customId === 'create_ticket') {

    const existingTicket = interaction.guild.channels.cache.find(
      c =>
        c.name ===
        `ticket-${interaction.user.username.toLowerCase()}`
    );

    if (existingTicket) {

      return interaction.reply({
        content: `❌ You already have an open ticket: ${existingTicket}`,
        ephemeral: true
      });
    }

    const supportRole = interaction.guild.roles.cache.find(
      r => r.name === 'Support'
    );

    const channel = await interaction.guild.channels.create({

      name: `ticket-${interaction.user.username}`,

      type: ChannelType.GuildText,

      permissionOverwrites: [

        {
          id: interaction.guild.id,
          deny: [
            PermissionsBitField.Flags.ViewChannel
          ]
        },

        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        },

        ...(supportRole ? [{
          id: supportRole.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }] : [])

      ]

    });

    const row = new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close Ticket')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Danger)

      );

    const embed = new EmbedBuilder()
      .setTitle('🎫 Ticket Created')
      .setDescription(
        `Welcome ${interaction.user}!\n\n` +
        `Please explain your issue.\n` +
        `Support will assist you shortly.`
      )
      .setColor(0x5865F2);

    await channel.send({

      content: `${interaction.user}`,

      embeds: [embed],

      components: [row]

    });

    await interaction.reply({

      content: `✅ Ticket created: ${channel}`,

      ephemeral: true

    });
  }

  // CLOSE TICKET

  if (interaction.customId === 'close_ticket') {

    await interaction.reply({

      content: '🔒 Closing ticket in 5 seconds...'

    });

    setTimeout(async () => {

      try {

        await interaction.channel.delete();

      } catch (err) {

        console.log(err);

      }

    }, 5000);
  }

});

// ============================================================
// LOGIN
// ============================================================

client.login(process.env.DISCORD_TOKEN);
