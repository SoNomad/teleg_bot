const { Telegraf } = require("telegraf");

const bot = new Telegraf("7422929739:AAEYb118A7MNpQ5w4CEJMx7mkbYb-ViIjGA");
const adminId = "5075515168"; // ID админа, куда идут вопросы

// Стартовое сообщение
bot.start((ctx) => ctx.reply("без негативчика"));

// Обработчик вопросов от пользователей
bot.on("text", async (ctx) => {
  const userId = ctx.message.from.id;
  const userName = ctx.message.from.username || ctx.message.from.first_name;

  await ctx.telegram.sendMessage(
    adminId,
    `❓ Вопрос от ${userName}:\n${ctx.message.text}`,
    { reply_markup: { force_reply: true } } // Включаем "ответить"
  );

  ctx.reply("✅ Ваш вопрос отправлен админу. Ожидайте ответа.");
});

// Обработчик ответов от админа (reply)
bot.on("message", async (ctx) => {
  if (!ctx.message.reply_to_message) return; // Если не ответ — игнорируем

  const replyToMessage = ctx.message.reply_to_message.text; // Оригинальный вопрос
  const userIdMatch = replyToMessage.match(/Вопрос от (.+):/); // Извлекаем имя (можно улучшить)

  if (!userIdMatch)
    return ctx.reply("⚠️ Не могу определить, кому отправить ответ.");

  const userId =
    ctx.message.reply_to_message.forward_from?.id ||
    ctx.message.reply_to_message.chat.id;
  const replyText = ctx.message.text;

  await ctx.telegram.sendMessage(userId, `💬 Ответ от админа:\n${replyText}`);
  ctx.reply("✅ Ответ отправлен пользователю.");
});

bot.launch();
console.log("🤖 Бот запущен!");
