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
});

// Обработчик ответов от админа
bot.on("message", async (ctx) => {
  // Проверяем, что сообщение от админа
  if (ctx.message.from.id.toString() !== adminId) return;

  // Если сообщение является ответом на другое сообщение
  if (ctx.message.reply_to_message) {
    const repliedMessageId = ctx.message.reply_to_message.message_id; // ID сообщения, на которое ответили
    const userId = userQuestions.get(repliedMessageId); // Ищем userId в хранилище

    if (!userId)
      return ctx.reply("⚠️ Не могу определить, кому отправить ответ.");

    const replyText = ctx.message.text; // Ответ админа

    try {
      await ctx.telegram.sendMessage(userId, `${replyText}`);
      ctx.reply(`✅ Ответ отправлен пользователю ${userId}.`);
    } catch (error) {
      ctx.reply(`❌ Ошибка при отправке ответа: ${error.message}`);
    }
  }
  // Если сообщение начинается с @username или ID пользователя
  else if (ctx.message.text) {
    const messageText = ctx.message.text;
    const parts = messageText.split(" ");

    if (parts.length < 2) {
      return ctx.reply(
        "⚠️ Формат сообщения: @username или ID пользователя, затем текст сообщения"
      );
    }

    const recipient = parts[0];
    const messageContent = parts.slice(1).join(" ");

    let targetUserId;

    // Проверяем, является ли получатель ID или username
    if (recipient.startsWith("@")) {
      // Если это username, нужно получить ID пользователя
      // В Telegraf нет прямого метода для получения ID по username
      // Можно использовать метод getChat, но он работает только если бот уже взаимодействовал с пользователем
      try {
        const chat = await ctx.telegram.getChat(recipient);
        targetUserId = chat.id;
      } catch (error) {
        return ctx.reply(
          `❌ Не удалось найти пользователя с username ${recipient}`
        );
      }
    } else {
      // Если это ID
      targetUserId = recipient;
    }

    try {
      await ctx.telegram.sendMessage(targetUserId, `${messageContent}`);
      ctx.reply(`✅ Сообщение отправлено пользователю ${targetUserId}.`);
    } catch (error) {
      ctx.reply(`❌ Ошибка при отправке сообщения: ${error.message}`);
    }
  }
});

bot.launch();
console.log("🤖 Бот запущен!");
