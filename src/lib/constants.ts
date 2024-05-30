export type TCurrency = (typeof currencies)[number];

export const currencies = [
  { value: "USD", label: "$ Dollar", locale: "en-US" },
  { value: "NGN", label: "₦ Naira", locale: "en-NG" },
  { value: "EUR", label: "€ Euro", locale: "de-DE" },
  { value: "JPY", label: "¥ Yen", locale: "ja-JP" },
  { value: "GBP", label: "£ Pound", locale: "en-GB" },
];

export const dateToUTCDate = (date: Date) => {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  );
};

export const MAX_DATE_RANGE_DAYS = 90;

export const formatter = (currency: string) => {
  const locale = currencies.find((c) => c.value === currency)?.locale;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
};

export const monthArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
