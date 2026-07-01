export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, business, email, phone, message } = req.body || {};

  if (!name || !business || !email) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    res.status(500).json({ error: 'Server not configured' });
    return;
  }

  const text = [
    'Бележка: Нов розов сайт 350 евро',
    '',
    'Нова заявка за демо — Kinetix',
    `Име: ${name}`,
    `Бизнес: ${business}`,
    `Имейл: ${email}`,
    phone ? `Телефон: ${phone}` : null,
    message ? `Съобщение: ${message}` : null,
  ].filter(Boolean).join('\n');

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!tgRes.ok) {
      res.status(502).json({ error: 'Telegram error' });
      return;
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
}
