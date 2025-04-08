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
  console.log("Получено сообщение от:", ctx.message.from.id);
  console.log("ID админа:", adminId);
  console.log("Это ответ на сообщение:", !!ctx.message.reply_to_message);

  // Проверяем, что сообщение от админа и является ответом на другое сообщение
  if (
    ctx.message.from.id.toString() !== adminId ||
    !ctx.message.reply_to_message
  ) {
    console.log("Сообщение пропущено: не от админа или не является ответом");
    return;
  }

  const repliedMessageId = ctx.message.reply_to_message.message_id;
  console.log("ID сообщения, на которое отвечают:", repliedMessageId);

  const userId = userQuestions.get(repliedMessageId);
  console.log("Найденный userId:", userId);
  console.log("Содержимое Map:", Array.from(userQuestions.entries()));

  if (!userId) {
    console.log("userId не найден в Map");
    return ctx.reply("⚠️ Не могу определить, кому отправить ответ.");
  }

  const replyText = ctx.message.text;
  console.log("Текст ответа:", replyText);

  try {
    console.log("Попытка отправки сообщения пользователю:", userId);
    await ctx.telegram.sendMessage(
      userId,
      `Ответ от администратора:\n${replyText}`
    );
    console.log("Сообщение успешно отправлено");
    await ctx.reply(`✅ Ответ отправлен пользователю ${userId}.`);
  } catch (error) {
    console.error("Ошибка при отправке:", error);
    await ctx.reply(`❌ Ошибка при отправке ответа: ${error.message}`);
  }
});

bot.launch();
console.log("🤖 Бот запущен!");
