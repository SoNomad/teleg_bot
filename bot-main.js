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
  // Пропускаем сообщения от админа
  if (ctx.message.from.id.toString() === adminId) return;

  const userId = ctx.message.from.id; // ID отправителя (юзера)
  const userName = ctx.message.from.username || ctx.message.from.first_name;

  // Отправляем сообщение админу и сохраняем ID сообщения
  const sentMessage = await ctx.telegram.sendMessage(
    adminId,
    `Вопрос от: ${userName} (ID: ${userId}):\n${ctx.message.text}`
  );

  // Сохраняем связь между сообщением и пользователем
  userQuestions.set(sentMessage.message_id, userId);

  // Подтверждаем пользователю, что его вопрос отправлен
  await ctx.reply("Ваш вопрос отправлен администратору. Ожидайте ответа.");
});

// Обработчик ответов от админа
bot.on("message", async (ctx) => {
  // Проверяем, что сообщение от админа и является ответом на другое сообщение
  if (
    ctx.message.from.id.toString() !== adminId ||
    !ctx.message.reply_to_message
  )
    return;

  const repliedMessageId = ctx.message.reply_to_message.message_id; // ID сообщения, на которое ответили
  const userId = userQuestions.get(repliedMessageId); // Ищем userId в хранилище

  if (!userId) return ctx.reply("⚠️ Не могу определить, кому отправить ответ.");

  const replyText = ctx.message.text; // Ответ админа

  try {
    await ctx.telegram.sendMessage(
      userId,
      `Ответ от администратора:\n${replyText}`
    );
    ctx.reply(`✅ Ответ отправлен пользователю ${userId}.`);
  } catch (error) {
    ctx.reply(`❌ Ошибка при отправке ответа: ${error.message}`);
  }
});

bot.launch();
console.log("🤖 Бот запущен!");
