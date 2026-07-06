export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, role, text, rating, photo } = req.body || {};

  if (!name || !role || !text || !rating || !photo) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    res.status(500).json({ error: 'Server not configured' });
    return;
  }

  try {
    // Parse the base64 photo
    const base64Parts = photo.split(',');
    const base64Data = base64Parts[1] || base64Parts[0];
    if (!base64Data) {
      res.status(400).json({ error: 'Invalid photo format' });
      return;
    }
    const buffer = Buffer.from(base64Data, 'base64');

    // Create form data to send image to Telegram
    const formData = new FormData();
    formData.append('chat_id', chatId);
    
    // Convert buffer to a Blob so fetch can upload it
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('photo', blob, 'avatar.jpg');
    
    // Add text info
    const caption = [
      '⭐️ Ново ревю за преглед — Kinetix ⭐️',
      '',
      `Име: ${name}`,
      `Бизнес / Роля: ${role}`,
      `Оценка: ${rating} звезди`,
      '',
      'Отзив:',
      `"${text}"`
    ].join('\n');
    formData.append('caption', caption);

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      body: formData,
    });

    if (!tgRes.ok) {
      const errInfo = await tgRes.json();
      console.error('[Telegram API Error]', errInfo);
      res.status(502).json({ error: 'Telegram error' });
      return;
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[Review Submit Exception]', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
}
