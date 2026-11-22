# vft-tma — Telegram Mini App VFT

@../vft-meta/CLAUDE.md

React 19, Vite, Tailwind 4, TON Connect UI, TanStack Query, `@tma.js/sdk-react`
(преемник `@telegram-apps`). Каркас — `acton init --create-dapp`.

## Команды

```bash
cp .env.example .env && npm ci
npm run sync-wrappers        # TS-обёртки контрактов из ../vft-contract/wrappers-ts
npm run dev                  # :5173, /api проксируется на индексатор 127.0.0.1:8080
npm run typecheck && npm run lint && npm test && npm run build
cloudflared tunnel --url http://127.0.0.1:5173   # проверка в Telegram (адрес — в BotFather)
```

## Важное

- Суммы показываем в **GRAM** (`CURRENCY` в `app/src/format.ts`); ввод и вывод — через
  `parseGrams`/`formatGrams`.
- Переводы `app/src/i18n/ru.ts` (источник ключей) и `en.ts` — добавлять ключи в оба.
- Тема своя, всегда тёмная, как у лендинга (`app/src/styles.css`): фиолетовый акцент, «за» — индиго, «против» — малиновый. Тему Telegram не используем; шапку и фон Telegram красим в `--bg` (`telegram.ts`), кнопку и окно TON Connect — в цвета бренда (`AppProviders.tsx`).
- Лимит текста — в **байтах** UTF-8 (как в контракте), а не в символах.
- Сообщения строятся сгенерированными обёртками (`wrappers-ts`), адрес голоса для отзыва
  вычисляется в приложении (`VftVote.fromStorage`) — тест сверяет его с testnet.
- Стандартное окно TON Connect оставляем (решение владельца).
- В dev Vite сам отдаёт `tonconnect-manifest.json` для текущего адреса; в проде нужен
  статический манифест на постоянном домене (`VITE_MANIFEST_URL`).
