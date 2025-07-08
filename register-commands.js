require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;


// Массив команд
const commands = [
  new SlashCommandBuilder()
    .setName('форма')
    .setDescription('Запланировать форму с кнопкой')
    .addStringOption(option =>
      option.setName('текст').setDescription('Текст формы').setRequired(true))
    .addStringOption(option =>
      option.setName('текст_кнопки').setDescription('Текст кнопки').setRequired(true))
    .addStringOption(option =>
      option.setName('время').setDescription('Время (HH:MM)').setRequired(true))
    .addStringOption(option =>
      option.setName('повтор')
        .setDescription('Один раз или ежедневно')
        .setRequired(true)
        .addChoices(
          { name: 'Один раз', value: 'once' },
          { name: 'Ежедневно', value: 'daily' },
        )),

  new SlashCommandBuilder()
    .setName('формаdell')
    .setDescription('Удалить форму по ID')
    .addStringOption(option =>
      option.setName('id').setDescription('ID формы').setRequired(true)),

  new SlashCommandBuilder()
    .setName('формаalldell')
    .setDescription('Удалить все формы'),

  new SlashCommandBuilder()
    .setName('формасписок')
    .setDescription('Просмотр запланированных форм'),

  new SlashCommandBuilder()
    .setName('формасразу')
    .setDescription('Отправить форму сразу')
    .addStringOption(option =>
      option.setName('текст').setDescription('Текст формы').setRequired(true))
    .addStringOption(option =>
      option.setName('текст_кнопки').setDescription('Текст кнопки').setRequired(true)),

  new SlashCommandBuilder()
    .setName('текст')
    .setDescription('Запланировать сообщение')
    .addStringOption(option =>
      option.setName('текст').setDescription('Текст сообщения').setRequired(true))
    .addStringOption(option =>
      option.setName('время').setDescription('Время (HH:MM)').setRequired(true))
    .addStringOption(option =>
      option.setName('повтор')
        .setDescription('Один раз или ежедневно')
        .setRequired(true)
        .addChoices(
          { name: 'Один раз', value: 'once' },
          { name: 'Ежедневно', value: 'daily' },
        )),

  new SlashCommandBuilder()
    .setName('текстdell')
    .setDescription('Удалить сообщение по ID')
    .addStringOption(option =>
      option.setName('id').setDescription('ID сообщения').setRequired(true)),

  new SlashCommandBuilder()
    .setName('текстalldell')
    .setDescription('Удалить все сообщения'),

  new SlashCommandBuilder()
    .setName('текстсписок')
    .setDescription('Просмотр запланированных сообщений'),

  new SlashCommandBuilder()
    .setName('текстсразу')
    .setDescription('Отправить сообщение сразу')
    .addStringOption(option =>
      option.setName('текст').setDescription('Текст сообщения').setRequired(true)),

].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
console.log('Очистка старых глобальных команд...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: [] } // Удаляем все глобальные команды
    );
    console.log('Старые глобальные команды удалены.');
    console.log('📤 Регистрируем глобальные команды...');
    await rest.put(
  Routes.applicationCommands(CLIENT_ID),
  { body: commands }
);
    console.log('✅ Глобальные команды зарегистрированы.');
  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
  }
})();
