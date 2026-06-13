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
const TELEGRAM_CHAT_IDS = ['1729913765', '7747638712', '8605564470'];
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

  // --- Канал 2: AmoCRM (если настроен) — ДО Telegram, чтобы получить ID сделки ---
  let amoLeadId = null;
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
      if (resp.ok) {
        channels.amocrm = true;
        amoLeadId = await extractAmoLeadId(resp);
      } else {
        console.error('AmoCRM error:', resp.status, await safeText(resp));
      }
    } catch (err) {
      console.error('AmoCRM exception:', err);
    }
  }

  // --- Канал 3: Telegram (если настроен) — после AmoCRM, с ID сделки ---
  if (process.env.TELEGRAM_BOT_TOKEN) {
    try {
      const text = formatTelegram(lead, amoLeadId);
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

function formatTelegram(lead, amoLeadId) {
  // Пустые поля строкой не выводим. Заголовок жирный, между ним и полями — пустая строка.
  const lines = [
    '🌐 <b>Новый лид С САЙТА</b>',
    '',
    amoLeadId ? `📋 Сделка: №${escapeHtml(amoLeadId)}` : null,
    lead.name ? `👤 Имя: ${escapeHtml(lead.name)}` : null,
    lead.phone ? `📞 Телефон: ${escapeHtml(lead.phone)}` : null,
    lead.product ? `📦 Интересует: ${escapeHtml(lead.product)}` : null,
    lead.comment ? `💬 Детали: ${escapeHtml(lead.comment)}` : null
  ];
  // Отбрасываем только null (пустые поля), но сохраняем пустую строку-разделитель.
  return lines.filter((l) => l !== null).join('\n');
}

// ID сделки из ответа AmoCRM /api/v4/leads/complex.
// complex возвращает массив [{ id, contact_id, ... }]; на всякий случай
// поддерживаем и форму { _embedded: { leads: [{ id }] } }.
async function extractAmoLeadId(resp) {
  try {
    const data = await resp.json();
    let id = null;
    if (Array.isArray(data)) id = data[0] && data[0].id;
    else if (data && data._embedded && Array.isArray(data._embedded.leads)) {
      id = data._embedded.leads[0] && data._embedded.leads[0].id;
    }
    return id != null ? String(id) : null;
  } catch (e) {
    console.error('AmoCRM parse error:', e);
    return null;
  }
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
