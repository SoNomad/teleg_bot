const { Telegraf } = require("telegraf");

const bot = new Telegraf("7422929739:AAEYb118A7MNpQ5w4CEJMx7mkbYb-ViIjGA");
const adminId = "5075515168"; // ID админа, куда идут вопросы
const userQuestions = new Map(); // Храним userId по сообщению

// Стартовое сообщение
const welcomeMessage = `без негативчика\n\n<i>Создано с помощью <a href="http://t.me/refatherbot?start=iagktybot">@ReFatherBot</a></i>`;

bot.start((ctx) =>
  ctx.replyWithHTML(welcomeMessage, {
    link_preview_options: { is_disabled: true },
  })
);
// Обработчик вопросов от пользователей
bot.on("text", async (ctx) => {
  const userId = ctx.message.from.id; // ID отправителя (юзера)
  const userName = ctx.message.from.username || ctx.message.from.first_name;

  await ctx.telegram.sendMessage(
    adminId,
    `Вопрос от: ${userName} (ID: ${userId}):\n${ctx.message.text}`
  );
  userQuestions.set(sentMessage.message_id, userId); // Связываем сообщение и userId
});

// Обработчик ответов от админа
bot.on("message", async (ctx) => {
  if (!ctx.message.reply_to_message) return; // Если не ответ — игнорируем

  const repliedMessageId = ctx.message.reply_to_message.message_id; // ID сообщения, на которое ответили
  const userId = userQuestions.get(repliedMessageId); // Ищем userId в хранилище

  if (!userId) return ctx.reply("⚠️ Не могу определить, кому отправить ответ.");

  const replyText = ctx.message.text; // Ответ админа

  await ctx.telegram.sendMessage(userId, `${replyText}`);
  ctx.reply(`✅ Ответ отправлен пользователю ${userId}.`);
});

bot.launch();
console.log("🤖 Бот запущен!");
