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
