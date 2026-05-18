// ============================================================
// OGS BOT - FINAL WORKING SUSHI VERSION
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
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===========================================================
// CONFIG
// ============================================================

const PREFIX = '!';
const WELCOME_CHANNEL_NAME = '👋・welcome';
const AUTO_ROLE_NAME = 'Member';
const BUMP_CHANNEL_NAME = 'server-bump';

const OWNER_ID = '613760928671989762';

const OWNER_VALO_NAMES = [
  'necksa',
  'lsdxnecksa'
];

// ============================================================
// ANTI SPAM CONFIG
// ============================================================

const FAMILY_ROLE_NAME = 'Family';

const SPAM_LIMIT = 5;
const SPAM_INTERVAL = 3000;
const SPAM_TIMEOUT = 3 * 60 * 1000;

const userMessages = new Map();

// ============================================================
// SUSHI PHOTO CONFIG
// ============================================================

const sushiCaptions = [
  'real 😭',
  'nahhh',
  'average general chat',
  'bro what',
  'me rn',
  '😭',
  'wild',
  'i cant do this anymore',
  'HELPPPP',
  'insane behavior'
];

let lastPhotoReply = 0;

const PHOTO_REPLY_COOLDOWN = 1000 * 60 * 10;

// ============================================================
// MEMORY + STATS
// ============================================================

const memory = new Map();
const stats = {};
const friendship = {};

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

  } catch (err) {

    console.log(err);

  }

  // WELCOME CHANNEL
  const channel = member.guild.channels.cache.find(
    c => c.name === '👋・welcome'
  );

  if (!channel) return;

  // WELCOME EMBED
  const embed = new EmbedBuilder()

    .setAuthor({
      name: 'OGs eSports',
      iconURL: member.guild.iconURL({ dynamic: true })
    })

    .setTitle('Welcome!')

    .setDescription(
`✧ Welcome to the Epicness ${member}

✧ You Are Our ${member.guild.memberCount}th Member!

✧ Chat & Make Friends In <#732282717831430254>

✧ Read Rules Carefully In <#732281800092811376> And Follow Them!

✧ Play Games & Have Fun With Your Friends!`
    )

    .setThumbnail(
      member.user.displayAvatarURL({ dynamic: true })
    )

    .setColor(0x5865F2);

  channel.send({
    embeds: [embed]
  });

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
  if (!message.guild) return;

  const member = message.member;

  const now = Date.now();

  const userId = message.author.id;

  const msg = message.content.toLowerCase();

  // ============================================================
  // ANTI SPAM SYSTEM
  // ============================================================

  if (!member.roles.cache.some(
    role => role.name === FAMILY_ROLE_NAME
  )) {

    if (!userMessages.has(userId)) {
      userMessages.set(userId, []);
    }

    let timestamps = userMessages.get(userId);

    timestamps = timestamps.filter(
      t => now - t < SPAM_INTERVAL
    );

    timestamps.push(now);

    userMessages.set(userId, timestamps);

    if (timestamps.length >= SPAM_LIMIT) {

      try {

        await member.timeout(
          SPAM_TIMEOUT,
          'Spam detected'
        );

        await message.channel.send(
          `${message.author} got timed out for spamming 😭`
        );

        userMessages.delete(userId);

      } catch (err) {

        console.log(err);

      }

      return;
    }
  }

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
!pet
!friendship
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

// PET COMMAND

if (command === 'pet') {

  if (!friendship[userId]) {
    friendship[userId] = 0;
  }

  const gain =
    Math.floor(Math.random() * 4) + 1;

  friendship[userId] += gain;

  const petResponses = [

    '🐶 Sushi wagged her tail happily',

    '😭 Sushi rolled over for belly rubs',

    '🐾 Sushi zoomies activated',

    '🐶 Sushi fell asleep on you',

    '💀 Sushi bit your hand playfully',

    '🐶 Sushi licked your face',

    '😭 Sushi demanded more pets',

    '🐾 Sushi brought you a random stick',

    '💀 Sushi stole your food and ran away',

    '🐶 Sushi climbed onto your lap'
  ];

  const response =
    petResponses[
      Math.floor(Math.random() * petResponses.length)
    ];

  let rank = 'Stranger';

  const points = friendship[userId];

  if (points > 20) rank = 'Friend';
  if (points > 50) rank = 'Bestie';
  if (points > 100) rank = 'Pack Member';
  if (points > 200) rank = 'Favorite Human';

  let rareEvent = '';

  if (Math.random() < 0.03) {

    const rareEvents = [

      '\n✨ Sushi gave you a legendary belly rub',

      '\n💎 Sushi considers you extra trustworthy today',

      '\n😭 Sushi refuses to leave your side',

      '\n🐶 Sushi brought you a rare gift'
    ];

    rareEvent =
      rareEvents[
        Math.floor(Math.random() * rareEvents.length)
      ];

    friendship[userId] += 10;
  }

  return message.reply(
`${response}

❤️ Friendship +${gain}

🐶 Total Friendship: ${friendship[userId]}

🏆 Rank: ${rank}${rareEvent}`
  );
}

// FRIENDSHIP COMMAND

if (command === 'friendship') {

  const points =
    friendship[userId] || 0;

  let rank = 'Stranger';

  if (points > 20) rank = 'Friend';
  if (points > 50) rank = 'Bestie';
  if (points > 100) rank = 'Pack Member';
  if (points > 200) rank = 'Favorite Human';

  return message.reply(
`🐶 Sushi Friendship Stats

❤️ Friendship: ${points}

🏆 Rank: ${rank}`
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
          'Click the button below to create a support ticket.'
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

  const passiveAllowed =
    now - lastPassiveReply > PASSIVE_COOLDOWN;

  const shouldPassiveReply =
    passiveAllowed &&
    Math.random() < 0.08;

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

      message.reply(
        replies[Math.floor(Math.random() * replies.length)]
      );
    }
  }
// ============================================================
// MANUAL SUSHI PIC COMMAND
// ============================================================

if (
  message.mentions.has(client.user) &&
  msg.includes('send pic')
) {

  try {

    const files =
      fs.readdirSync('./photos');

    console.log(files);

    if (!files.length) {
      return message.reply('no pics found 😭');
    }

    const randomImage =
      files[Math.floor(Math.random() * files.length)];

    const imagePath =
      `./photos/${randomImage}`;

    await message.channel.sendTyping();

    await new Promise(resolve =>
      setTimeout(resolve, 1500)
    );

    await message.reply({
      content: '😭',
      files: [imagePath]
    });

  } catch (err) {

    console.log(err);

    message.reply('something broke 😭');
  }
}
  // ============================================================
  // RANDOM SUSHI PHOTO REPLIES
  // ============================================================

  const photoAllowed =
    now - lastPhotoReply > PHOTO_REPLY_COOLDOWN;

  const shouldSendPhoto =
    photoAllowed &&
    Math.random() < 0.08;

  if (
  shouldSendPhoto &&
  !message.content.startsWith(PREFIX)
) {

    try {

      const files =
        fs.readdirSync('./photos');

      console.log(files);

      if (!files.length) return;

      const randomImage =
        files[Math.floor(Math.random() * files.length)];

      const imagePath =
        `./photos/${randomImage}`;

      const caption =
        sushiCaptions[
          Math.floor(Math.random() * sushiCaptions.length)
        ];

      await message.channel.sendTyping();

      await new Promise(resolve =>
        setTimeout(resolve, 2000)
      );

      await message.reply({
        content: caption,
        files: [imagePath]
      });

      console.log('IMAGE SENT');

      lastPhotoReply = now;

    } catch (err) {

      console.log(err);

    }
  }

});

// ============================================================
// TICKET SYSTEM
// ============================================================

client.on('interactionCreate', async (interaction) => {

  if (!interaction.isButton()) return;

  // ============================================================
  // CREATE TICKET
  // ============================================================

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
      .setTitle('🍣 Sushi • Brawlers Registration')
      .setDescription(
`If you're here for the 🎮 Brawlers Tournament Registration, please complete all the steps below carefully:

1️⃣ Join our Discord server.
2️⃣ Follow BOTH Instagram pages. 
    @_ggwp.rip_
    @ogs.igc
    
3️⃣ All 5 team members must also follow BOTH Instagram pages.
4️⃣ Send screenshots as proof.
5️⃣ Send your Team Name.

Once verified, your team will be officially registered ✅`
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

  // ============================================================
  // CLOSE TICKET
  // ============================================================

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
