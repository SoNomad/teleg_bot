const { Telegraf } = require("telegraf");

const bot = new Telegraf("7422929739:AAEYb118A7MNpQ5w4CEJMx7mkbYb-ViIjGA");
const adminId = "5075515168"; // ID админа, куда идут вопросы

// Стартовое сообщение
const welcomeMessage = `без негативчика\n\n<i>Создано с помощью <a href="http://t.me/refatherbot?start=iagktybot">@ReFatherBot</a></i>`;

bot.start((ctx) => ctx.replyWithHTML(welcomeMessage), {
  disable_web_page_preview: true,
});

// Обработчик вопросов от пользователей
bot.on("text", async (ctx) => {
  const userId = ctx.message.from.id; // ID отправителя (юзера)
  const userName = ctx.message.from.username || ctx.message.from.first_name;

  await ctx.telegram.sendMessage(
    adminId,
    `Вопрос от: ${userName} (ID: ${userId}):\n${ctx.message.text}`,
    { reply_markup: { force_reply: true } } // Добавляем "ответить"
  );
});

// Обработчик ответов от админа
bot.on("message", async (ctx) => {
  if (!ctx.message.reply_to_message) return; // Если не ответ — игнорируем

  const replyToMessage = ctx.message.reply_to_message.text; // Оригинальный вопрос
  const userIdMatch = replyToMessage.match(/\(ID: (\d+)\)/); // Извлекаем userId

  if (!userIdMatch)
    return ctx.reply(
      "⚠️ Не могу определить, кому отправить ответ. Аккаунт без юзернейма"
    );

  const userId = userIdMatch[1]; // Берём userId из скобок
  const replyText = ctx.message.text; // Ответ админа

  await ctx.telegram.sendMessage(userId, `${replyText}`);
  ctx.reply("✅ Ответ отправлен пользователю.");
});

bot.launch();
console.log("🤖 Бот запущен!");
