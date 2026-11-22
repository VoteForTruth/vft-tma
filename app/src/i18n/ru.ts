export const ru = {
  appName: 'Vote For Truth',
  feed: {
    title: 'Вопросы',
    important: 'Важные',
    new: 'Новые',
    active: 'Активные',
    empty: 'Пока нет ни одного вопроса',
    ask: 'Задать вопрос',
  },
  statement: {
    pro: 'За',
    con: 'Против',
    noArguments: 'Аргументов пока нет',
    source: 'Источник',
    author: 'Автор',
    support: 'Поддержать',
    dispute: 'Оспорить',
    donate: 'Донат автору',
    share: 'Поделиться',
    hidden: 'Скрыто модерацией',
    notFound: 'Утверждение не найдено',
  },
  votes: {
    voters: (n: number) =>
      `${n} ${plural(n, 'участник', 'участника', 'участников')}`,
    arguments: (n: number) =>
      `${n} ${plural(n, 'аргумент', 'аргумента', 'аргументов')}`,
    concentration: (share: number, top: number) =>
      `${Math.round(share * 100)}% — от ${top} ${plural(top, 'кошелька', 'кошельков', 'кошельков')}`,
    weightHint: 'Голос набирает полный вес за 7 дней',
  },
  profile: {
    title: 'Профиль',
    connect: 'Подключите кошелёк, чтобы голосовать и создавать вопросы',
    myVotes: 'Мои голоса',
    myStatements: 'Мои вопросы и аргументы',
    donations: 'Полученные донаты',
    nothing: 'Пока ничего нет',
    weight: 'вес',
  },
  actions: {
    support: 'Поддержать',
    donate: 'Донат',
    share: 'Поделиться',
    addPro: '+ Аргумент «за»',
    addCon: '+ Аргумент «против»',
    ask: '+ Задать вопрос',
    cancel: 'Отмена',
    sent: 'Транзакция отправлена, данные обновятся через несколько секунд',
    failed: 'Не удалось отправить транзакцию',
    copied: 'Ссылка скопирована',
    invalidAmount: 'Введите сумму, например 1.5',
  },
  vote: {
    title: 'Голос',
    current: 'Ваш голос',
    add: 'Добавить',
    revoke: 'Отозвать',
    revokeAll: 'Отозвать всё',
    amount: 'Сумма, GRAM',
    send: 'Проголосовать',
    hint: 'Деньги остаются вашими: их можно забрать в любой момент. Голос набирает полный вес за 7 дней.',
    gas: 'Ещё 0.1 GRAM уйдёт на комиссию сети, лишнее вернётся',
  },
  create: {
    root: 'Новый вопрос',
    pro: 'Аргумент «за»',
    con: 'Аргумент «против»',
    text: 'Короткий тезис',
    url: 'Ссылка на источник (необязательно)',
    bytes: (n: number, max: number) => `${n} / ${max} байт`,
    tooLong: 'Слишком длинный текст',
    urlTooLong: 'Слишком длинная ссылка',
    cost: 'Публикация стоит 0.1 GRAM: 0.05 остаётся в контракте навсегда, остальное вернётся. Текст нельзя будет изменить.',
    publish: 'Опубликовать',
  },
  donate: {
    title: 'Донат автору',
    hint: 'Вся сумма сразу уйдёт автору',
    send: 'Отправить',
  },
  common: {
    loading: 'Загрузка…',
    error: 'Не удалось загрузить данные',
    retry: 'Повторить',
  },
};

// Russian plural forms: 1 участник, 2 участника, 5 участников
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
