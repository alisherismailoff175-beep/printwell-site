// public/api/chat.js — AI-консультант PrintWell на Claude API
// Лежит внутри public/, т.к. Root Directory проекта в Vercel = public/.
import { saveLead } from '../lib/saveLead.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'No message' });
  }

  const SYSTEM_PROMPT = `Ты — AI-консультант типографии PrintWell (Ташкент, Узбекистан).

О компании: PrintWell — типография полного цикла. Производим:
- Картонные коробки (все виды и форматы)
- Брендированные бумажные пакеты
- Самоклеящиеся этикетки и ярлыки для текстиля
- Блокноты, папки, кубарики, каталоги, брошюры, визитки
- Нанесение логотипа на мерч (ручки, термосы, кружки)
- Постпресс: фольгирование, тиснение, Spot UV, ламинация, высечка

НЕ производим: крафт-мешки, тканевые сумки, фартуки, этикетки для алкоголя/табака.

Контакты: +998 90 903 55 52, printwell@list.ru, сайт printwell.uz

Твоя задача:
1. Отвечай на вопросы о продукции и услугах PrintWell
2. Уточняй детали: тираж, размер, отделка, материал
3. Если клиент готов заказать — направь на форму: printwell.uz/request.html
4. Отвечай на языке клиента (русский или узбекский)
5. Будь конкретным, дружелюбным, профессиональным
6. НЕ называй цены (зависят от тиража — направляй на заявку)

ЯЗЫК ОТВЕТА:
- Определяй язык по последнему сообщению клиента и отвечай на нём же.
- Если клиент пишет по-узбекски — отвечай ЧИСТЫМ литературным узбекским языком на латинице (oʻzbek lotin alifbosi). Используй букву «ў» как «oʻ», «ғ» как «gʻ».
- НЕ смешивай узбекский с русским: никаких русских слов, окончаний или кириллицы внутри узбекского ответа.
- Используй правильные узбекские термины полиграфии, а не русизмы:
  • тираж → tiraj (adad/miqdor)
  • нанесение логотипа → logotip tushirish
  • тиснение → relef bosma
  • фольгирование → folga bosish
  • ламинация → laminatsiya (plyonka qoplash)
  • высечка → shtans (qirqish)
  • картонные коробки → karton qutilar
  • бумажные пакеты → qogʻoz paketlar
  • заявка → ariza
- Слово «заявка» по-узбекски — «ariza» (никогда не пиши «заявка» кириллицей).
- Не выдумывай несуществующих слов; если сомневаешься в термине — используй простое понятное узбекское описание.

СБОР КОНТАКТА:
Когда клиент проявляет интерес к заказу (спрашивает про конкретный продукт, тираж, сроки) — естественно и ненавязчиво предложи оставить заявку: спроси как к нему обращаться (имя) и номер телефона, чтобы менеджер связался с расчётом. Не дави, спрашивай по одному. НЕ проси контакт в первом же сообщении — сначала ответь на вопрос, помоги, и только когда виден реальный интерес.
ВАЖНО про сохранение: как только у тебя есть И имя, И телефон — НЕМЕДЛЕННО вызови инструмент save_lead. НЕ задавай больше вопросов о продукте перед сохранением. Размер, тираж, отделку, материал — если они уже прозвучали в диалоге, передай их в поле comment; если нет — оставь comment пустым, менеджер уточнит при звонке. НЕ откладывай вызов save_lead ради сбора дополнительных характеристик. После успешного сохранения поблагодари и скажи, что менеджер свяжется в ближайшее время.`;

  // Выбор модели по языку сообщения: узбекский → Sonnet (чище язык),
  // русский → Haiku (быстро/дёшево, качество достаточное).
  // На сайте русский = кириллица, узбекский = латиница.
  // Узбекская кириллица (ў, қ, ғ, ҳ) тоже считается узбекским.
  function pickModel(text) {
    const s = String(text || '');
    if (/[ўқғҳЎҚҒҲ]/.test(s)) return 'claude-sonnet-4-6';       // узбекская кириллица
    if (/[а-яё]/i.test(s)) return 'claude-haiku-4-5';           // русский (кириллица)
    if (/[a-z]/i.test(s)) return 'claude-sonnet-4-6';           // латиница → узбекский
    return 'claude-haiku-4-5';                                   // по умолчанию
  }
  const model = pickModel(message);

  // Инструмент сохранения заявки — модель вызывает его, когда есть имя+телефон.
  const SAVE_LEAD_TOOL = {
    name: 'save_lead',
    description:
      'Сохранить заявку клиента. Вызывай ТОЛЬКО когда у тебя есть и имя, и номер телефона клиента, и он заинтересован в заказе.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Имя клиента' },
        phone: { type: 'string', description: 'Номер телефона' },
        product: { type: 'string', description: 'Какой продукт интересует (коробки, пакеты, этикетки и т.д.)' },
        comment: { type: 'string', description: 'Детали: тираж, размер, отделка' }
      },
      required: ['name', 'phone']
    }
  };

  // Один вызов Anthropic Messages API с подключённым инструментом.
  function callAnthropic(messages) {
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        tools: [SAVE_LEAD_TOOL],
        messages
      })
    });
  }

  // Собираем текст из блоков ответа (ответ может содержать tool_use без text).
  function textFrom(content) {
    if (!Array.isArray(content)) return '';
    return content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
  }

  try {
    const messages = [...history.slice(-10), { role: 'user', content: message }];

    let response = await callAnthropic(messages);
    if (!response.ok) {
      console.error('Anthropic error:', await response.text());
      return res.status(500).json({ error: 'AI error' });
    }
    let data = await response.json();

    // Tool use loop: модель решила сохранить заявку.
    if (data.stop_reason === 'tool_use') {
      const toolUse = (data.content || []).find(
        (b) => b.type === 'tool_use' && b.name === 'save_lead'
      );

      if (toolUse) {
        let toolResultContent = 'Заявка сохранена.';
        try {
          const result = await saveLead({ ...toolUse.input, source: 'AI-чат' });
          toolResultContent = result.ok
            ? 'Заявка успешно сохранена, менеджер свяжется с клиентом в ближайшее время.'
            : 'Заявку временно не удалось сохранить, но данные приняты.';
        } catch (e) {
          console.error('saveLead error:', e);
          toolResultContent = 'Заявку временно не удалось сохранить.';
        }

        // Второй запрос: отдаём модели результат инструмента, получаем финальный текст.
        const followupMessages = [
          ...messages,
          { role: 'assistant', content: data.content },
          {
            role: 'user',
            content: [
              { type: 'tool_result', tool_use_id: toolUse.id, content: toolResultContent }
            ]
          }
        ];

        response = await callAnthropic(followupMessages);
        if (!response.ok) {
          console.error('Anthropic error (followup):', await response.text());
          // Заявка уже сохранена — отдаём запасной текст, чтобы клиент не остался без ответа.
          return res
            .status(200)
            .json({ reply: 'Спасибо! Заявка принята, менеджер скоро свяжется с вами.' });
        }
        data = await response.json();
      }
    }

    return res.status(200).json({ reply: textFrom(data.content) });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
