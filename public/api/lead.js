// public/api/lead.js — приём заявки из формы request.html.
// Проводит её через тот же модуль saveLead, что и AI-чат
// (Formspree + AmoCRM + Telegram), с пометкой source: 'форма сайта'.
import { saveLead } from '../lib/saveLead.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, product, comment } = req.body || {};
  if (!name || !phone) {
    return res.status(400).json({ error: 'Имя и телефон обязательны' });
  }

  try {
    const result = await saveLead({ name, phone, email, product, comment, source: 'форма сайта' });
    // Успех, если заявка ушла хотя бы в один канал (почта/AmoCRM/Telegram).
    const delivered =
      result.ok || (result.channels && (result.channels.amocrm || result.channels.telegram));
    if (delivered) return res.status(200).json({ ok: true });
    return res.status(502).json({ ok: false, error: 'Не удалось сохранить заявку' });
  } catch (error) {
    console.error('lead handler error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
