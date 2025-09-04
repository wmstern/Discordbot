const developers = (process.env.DEVELOPERS ?? '').split(',');

const discordBotToken = process.env.DISCORD_BOT_TOKEN;

if (!discordBotToken) throw new Error('require discord bot token');

const discordClientId = process.env.DISCORD_CLIENT_ID;
const discordGuildId = process.env.DISCORD_GUILD_ID;

if (!discordClientId || !discordGuildId) throw new Error('require client id or guild id');

export default Object.freeze({
  env: Object.freeze({
    developers,
    discordBotToken,
    discordClientId,
    discordGuildId
  })
});
