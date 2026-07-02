// Phone formatting to E.164 standard for Twilio
function formatTwilioPhone(phone) {
  if (!phone) return null;
  // Remove all non-digit and non-plus characters
  let cleaned = phone.replace(/[^0-9+]/g, '');
  
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  if (cleaned.startsWith('00')) {
    return '+' + cleaned.substring(2);
  }
  
  if (cleaned.startsWith('0')) {
    return '+359' + cleaned.substring(1);
  }
  
  if (cleaned.startsWith('359')) {
    return '+' + cleaned;
  }
  
  // If it's a standard Bulgarian mobile number length without prefix (e.g. 888123456)
  if (cleaned.length === 9) {
    return '+359' + cleaned;
  }
  
  return '+' + cleaned; // fallback
}

// Twilio SMS Sender
async function sendTwilioSMS(toPhone) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    console.warn('[Twilio API Warning] Account SID (TWILIO_ACCOUNT_SID), Auth Token (TWILIO_AUTH_TOKEN) or Phone Number (TWILIO_PHONE_NUMBER) is not configured.');
    return;
  }

  const formattedTo = formatTwilioPhone(toPhone);
  if (!formattedTo) return;

  const messageBody = 'Благодарим ви! Екипът ни скоро ще разгледа заявката ви и ще се свърже с вас.';

  const params = new URLSearchParams();
  params.append('To', formattedTo);
  params.append('From', fromPhone);
  params.append('Body', messageBody);

  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Twilio API Error] Failed to send SMS:', result);
    } else {
      console.log('[Twilio API Success] SMS sent successfully. Message SID:', result.sid);
    }
  } catch (error) {
    console.error('[Twilio API Exception] Error sending SMS:', error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { phone, message } = req.body || {};

  if (!phone || !message) {
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
    `Телефон: ${phone}`,
    `Какъв сайт искаме: ${message}`,
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

    // Trigger Twilio SMS async (wrapped inside try-catch to ensure we never fail the main flow)
    try {
      await sendTwilioSMS(phone);
    } catch (twilioErr) {
      console.error('[Twilio SMS Integration Error]', twilioErr);
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
}
