// public/api/chat.js — AI-консультант PrintWell на Claude API
// Лежит внутри public/, т.к. Root Directory проекта в Vercel = public/.
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
- Не выдумывай несуществующих слов; если сомневаешься в термине — используй простое понятное узбекское описание.`;

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

  try {
    const messages = [...history.slice(-10), { role: 'user', content: message }];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
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
        messages
      })
    });

    if (!response.ok) {
      console.error('Anthropic error:', await response.text());
      return res.status(500).json({ error: 'AI error' });
    }

    const data = await response.json();
    return res.status(200).json({ reply: data.content?.[0]?.text || '' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
