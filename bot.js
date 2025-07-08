require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const cron = require('node-cron');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const TOKEN = process.env.BOT_TOKEN;

const scheduledForms = new Map();      // id: { task, data }
const scheduledMessages = new Map();   // id: { task, data }

client.commands = new Collection();

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Кнопка формы
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isButton() && interaction.customId === 'form_button') {
    await interaction.reply({ content: `${interaction.user} записался(лась)!`, ephemeral: true });
    await interaction.channel.send(`${interaction.user} поедет на проверку.`);
  }
});

// Slash команды
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;

  if (cmd === 'форма') {
    const title = interaction.options.getString('текст');
    const label = interaction.options.getString('текст_кнопки');
    const time = interaction.options.getString('время');
    const freq = interaction.options.getString('повтор');

    const [h, m] = time.split(':');
    const cronTime = `${m} ${h} * * *`;
    const id = Date.now().toString();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('form_button').setLabel(label).setStyle(ButtonStyle.Primary)
    );

    const task = cron.schedule(cronTime, async () => {
      await interaction.channel.send({ content: title, components: [row] });
      if (freq === 'once') {
        task.stop();
        scheduledForms.delete(id);
      }
    }, { timezone: 'Europe/Moscow' });

    scheduledForms.set(id, { task, title, label, time, freq });
    await interaction.reply({ content: `✅ Форма запланирована. ID: ${id}`, ephemeral: true });
  }

  if (cmd === 'текст') {
    const text = interaction.options.getString('текст');
    const time = interaction.options.getString('время');
    const freq = interaction.options.getString('повтор');

    const [h, m] = time.split(':');
    const cronTime = `${m} ${h} * * *`;
    const id = Date.now().toString();

    const task = cron.schedule(cronTime, async () => {
      await interaction.channel.send(text);
      if (freq === 'once') {
        task.stop();
        scheduledMessages.delete(id);
      }
    }, { timezone: 'Europe/Moscow' });

    scheduledMessages.set(id, { task, text, time, freq });
    await interaction.reply({ content: `✅ Сообщение запланировано. ID: ${id}`, ephemeral: true });
  }

  if (cmd === 'формасписок') {
    if (scheduledForms.size === 0) return interaction.reply({ content: '❌ Форм нет.', ephemeral: true });
    const out = Array.from(scheduledForms.entries()).map(([id, f]) =>
      `🆔 ${id} | Время: ${f.time} | Повтор: ${f.freq}`).join('\n');
    await interaction.reply({ content: out, ephemeral: true });
  }

  if (cmd === 'текстсписок') {
    if (scheduledMessages.size === 0) return interaction.reply({ content: '❌ Сообщений нет.', ephemeral: true });
    const out = Array.from(scheduledMessages.entries()).map(([id, m]) =>
      `🆔 ${id} | Время: ${m.time} | Повтор: ${m.freq}`).join('\n');
    await interaction.reply({ content: out, ephemeral: true });
  }

  if (cmd === 'формаdell') {
    const id = interaction.options.getString('id');
    const form = scheduledForms.get(id);
    if (!form) return interaction.reply({ content: '❌ Форма не найдена.', ephemeral: true });
    form.task.stop();
    scheduledForms.delete(id);
    await interaction.reply({ content: `✅ Удалена форма ID ${id}`, ephemeral: true });
  }

  if (cmd === 'формаalldell') {
    scheduledForms.forEach(f => f.task.stop());
    scheduledForms.clear();
    await interaction.reply({ content: '✅ Все формы удалены.', ephemeral: true });
  }

  if (cmd === 'текстdell') {
    const id = interaction.options.getString('id');
    const msg = scheduledMessages.get(id);
    if (!msg) return interaction.reply({ content: '❌ Сообщение не найдено.', ephemeral: true });
    msg.task.stop();
    scheduledMessages.delete(id);
    await interaction.reply({ content: `✅ Удалено сообщение ID ${id}`, ephemeral: true });
  }

  if (cmd === 'текстalldell') {
    scheduledMessages.forEach(m => m.task.stop());
    scheduledMessages.clear();
    await interaction.reply({ content: '✅ Все сообщения удалены.', ephemeral: true });
  }

  if (cmd === 'формасразу') {
    const title = interaction.options.getString('текст');
    const label = interaction.options.getString('текст_кнопки');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('form_button').setLabel(label).setStyle(ButtonStyle.Primary)
    );
    await interaction.channel.send({ content: title, components: [row] });
    await interaction.reply({ content: '✅ Форма отправлена.', ephemeral: true });
  }

  if (cmd === 'текстсразу') {
    const text = interaction.options.getString('текст');
    await interaction.channel.send(text);
    await interaction.reply({ content: '✅ Сообщение отправлено.', ephemeral: true });
  }
});

client.login(TOKEN);
