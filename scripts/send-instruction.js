// scripts/send-instruction.js
// Разовая рассылка PDF-инструкции менеджерам через Telegram-бота.
//
// Токен НЕ хранится в коде — читается из переменной окружения TG.
// Запуск (PowerShell):
//   $env:TG = "СЮДА_ТОКЕН_БОТА"
//   node scripts/send-instruction.js
//   $env:TG = $null
//
// По умолчанию шлёт docs/leads-instruction.pdf всем трём получателям.
// Можно передать другой путь к файлу первым аргументом:
//   node scripts/send-instruction.js путь/к/файлу.pdf
//
// Требует Node 18+ (встроенные fetch / FormData / Blob).

const fs = require('fs');
const path = require('path');

const token = process.env.TG;
if (!token) {
  console.error('Нет токена. Задайте его перед запуском:  $env:TG = "ТОКЕН_БОТА"');
  process.exit(1);
}

const pdfPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '..', 'docs', 'leads-instruction.pdf');

if (!fs.existsSync(pdfPath)) {
  console.error('Файл не найден:', pdfPath);
  process.exit(1);
}

// Получатели (chat_id не секрет). При необходимости отредактируйте список.
const RECIPIENTS = [
  { id: '1729913765', who: 'Алишер' },
  { id: '7747638712', who: 'менеджер' },
  { id: '8605564470', who: 'директор' }
];

const CAPTION =
  '📋 Инструкция для менеджеров: как работают заявки с сайта PrintWell ' +
  '(AI-чат + форма → Telegram, AmoCRM, почта).';

(async () => {
  const bytes = fs.readFileSync(pdfPath);
  let ok = 0;
  for (const r of RECIPIENTS) {
    try {
      const fd = new FormData();
      fd.append('chat_id', r.id);
      fd.append('caption', CAPTION);
      fd.append(
        'document',
        new Blob([bytes], { type: 'application/pdf' }),
        'PrintWell-инструкция-заявки.pdf'
      );
      const resp = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
        method: 'POST',
        body: fd
      });
      const data = await resp.json();
      if (data.ok) {
        ok++;
        console.log(`${r.who} (${r.id}): отправлено ✓`);
      } else {
        console.log(`${r.who} (${r.id}): ОШИБКА — ${JSON.stringify(data)}`);
      }
    } catch (e) {
      console.log(`${r.who} (${r.id}): ОШИБКА — ${e.message}`);
    }
  }
  console.log(`\nИтого отправлено: ${ok}/${RECIPIENTS.length}`);
})();
