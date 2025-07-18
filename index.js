require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  Events,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// 🔧 Configuration
const TOKEN = process.env.TOKEN || 'MTM5NTY5NzkzOTAzNjUwODIzMA.G74cSX.aNGuXXYae_DK-XdcbB-BX5W4dJpsRjlbdXp3ZE'; // Use env or direct paste
const ROLE_ID = '1381372058260213800';     // example: '123456789012345678'
const CHANNEL_ID = '1381373473154138295'; // optional, used only if needed for fixed channel
const LOG_CHANNEL_ID = '1395775782961283072';
const WELCOME_CHANNEL_ID = '1381373651642744863';



// 🛠 Register Slash Commands
const commands = [
  new SlashCommandBuilder()
    .setName('sendverify')
    .setDescription('Send the verification message with a button')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('✅ Slash command /sendverify registered successfully!');
  } catch (error) {
    console.error('❌ Failed to register slash commands:', error);
  }
});

// 🎯 Handle Interactions (Slash commands + Button)
client.on(Events.InteractionCreate, async interaction => {
  // Slash command: /sendverify
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'sendverify') {
      const button = new ButtonBuilder()
        .setCustomId('verify_button')
        .setLabel('✅ Verify!')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(button);

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('🔐 Verification Required')
        .setDescription('Click the button below to verify and gain access to the server!\nYou will receive the ✅ role automatically.')
        .setFooter({ text: 'Wom Club Bot', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: '✅ Verification message sent!', ephemeral: true });
    }
    return;
  }

  // Button click: verify_button
  if (interaction.isButton()) {
    if (interaction.customId === 'verify_button') {
      const role = interaction.guild.roles.cache.get(ROLE_ID);
      if (!role) {
        return interaction.reply({
          content: '❌ Role not found. Please contact an admin.',
          ephemeral: true
        });
      }

      const member = interaction.member;
      if (member.roles.cache.has(role.id)) {
        return interaction.reply({
          content: 'You already have the verification role!',
          ephemeral: true
        });
      }

      await member.roles.add(role);
      await interaction.reply({
        content: `✅ You have been verified and received the **${role.name}** role!`,
        ephemeral: true
      });
    }
  }
  
  // Send welcome message in public channel
  const welcomeChannel = interaction.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (welcomeChannel) {
    welcomeChannel.send({
      content: `🎉 Welcome ${interaction.user} to the server! You now have full access.`
    });
  }
  // Log to staff channel
  const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (logChannel) {
    logChannel.send({
      content: `🔔 **User Verified:** ${interaction.user} has verified and received the role ✅`
    });
  }


  // Optionally, send DM
  try {
    await interaction.user.send(
      '👋 Welcome! You have been verified and now have access to the full server.'
    );
  } catch (err) {
    console.warn(`❗ Could not send DM to ${interaction.user.tag}`);
  }

});

// 🟢 Login
client.login(process.env.DISCORD_TOKEN);





