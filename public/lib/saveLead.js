// public/lib/saveLead.js
// Общий модуль сохранения заявки. Лежит в public/lib/ (НЕ в public/api/),
// поэтому Vercel НЕ превращает его в отдельную serverless-функцию;
// chat.js импортирует его как ../lib/saveLead.js (Vercel бандлит в функцию).
//
// Каналы:
//   1. Formspree  — всегда (бэкап на почту, работает сразу).
//   2. Telegram   — если задан process.env.TELEGRAM_BOT_TOKEN.
//   3. AmoCRM     — если задан process.env.AMOCRM_ACCESS_TOKEN.
// Каждый канал изолирован в своём try/catch: падение одного не роняет остальные.
// Возвращает { ok: true } если хотя бы Formspree отработал.
//
// Токены НЕ хардкодятся — только process.env. Telegram chat_id не секрет (зашит).

const FORMSPREE_URL = 'https://formspree.io/f/xojzkovb';
const TELEGRAM_CHAT_IDS = ['1729913765', '7747638712'];
const AMOCRM_DOMAIN = 'gulom1071.amocrm.ru';

export async function saveLead({ name, phone, email, product, comment, source } = {}) {
  const lead = {
    name: (name || '').trim(),
    phone: (phone || '').trim(),
    email: (email || '').trim(),
    product: (product || '').trim(),
    comment: (comment || '').trim(),
    source: (source || 'сайт').trim()
  };

  const channels = { formspree: false, telegram: false, amocrm: false };

  // --- Канал 1: Formspree (всегда) ---
  try {
    const resp = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        product: lead.product,
        comment: lead.comment,
        source: lead.source
      })
    });
    if (resp.ok) channels.formspree = true;
    else console.error('Formspree error:', resp.status, await safeText(resp));
  } catch (err) {
    console.error('Formspree exception:', err);
  }

  // --- Канал 2: Telegram (если настроен) ---
  if (process.env.TELEGRAM_BOT_TOKEN) {
    try {
      const text = formatTelegram(lead);
      const results = await Promise.all(
        TELEGRAM_CHAT_IDS.map((chatId) =>
          fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
          })
            .then((r) => r.ok)
            .catch((e) => {
              console.error('Telegram send exception:', e);
              return false;
            })
        )
      );
      channels.telegram = results.some(Boolean);
    } catch (err) {
      console.error('Telegram exception:', err);
    }
  }

  // --- Канал 3: AmoCRM (если настроен) ---
  if (process.env.AMOCRM_ACCESS_TOKEN) {
    try {
      const body = [
        {
          name: `Заявка с сайта — ${lead.product || 'PrintWell'}`,
          _embedded: {
            contacts: [
              {
                name: lead.name || 'Клиент',
                custom_fields_values: buildAmoContactFields(lead)
              }
            ]
          }
        }
      ];
      const resp = await fetch(`https://${AMOCRM_DOMAIN}/api/v4/leads/complex`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.AMOCRM_ACCESS_TOKEN}`
        },
        body: JSON.stringify(body)
      });
      if (resp.ok) channels.amocrm = true;
      else console.error('AmoCRM error:', resp.status, await safeText(resp));
    } catch (err) {
      console.error('AmoCRM exception:', err);
    }
  }

  return { ok: channels.formspree, channels };
}

function buildAmoContactFields(lead) {
  const fields = [];
  if (lead.phone) {
    fields.push({ field_code: 'PHONE', values: [{ enum_code: 'WORK', value: lead.phone }] });
  }
  if (lead.email) {
    fields.push({ field_code: 'EMAIL', values: [{ enum_code: 'WORK', value: lead.email }] });
  }
  return fields;
}

function formatTelegram(lead) {
  const lines = [
    '🆕 <b>Новая заявка</b>',
    lead.source ? `Источник: ${escapeHtml(lead.source)}` : null,
    lead.name ? `Имя: ${escapeHtml(lead.name)}` : null,
    lead.phone ? `Телефон: ${escapeHtml(lead.phone)}` : null,
    lead.email ? `Email: ${escapeHtml(lead.email)}` : null,
    lead.product ? `Продукт: ${escapeHtml(lead.product)}` : null,
    lead.comment ? `Детали: ${escapeHtml(lead.comment)}` : null
  ];
  return lines.filter(Boolean).join('\n');
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function safeText(resp) {
  try {
    return await resp.text();
  } catch (e) {
    return '<no body>';
  }
}
