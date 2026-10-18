export const formatCop = (value: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPricePerM2 = (priceCop: number, m2: number): string => {
  if (!m2 || m2 <= 0) return "$0 / m2";
  const val = Math.round(priceCop / m2);
  return `${formatCop(val)} / m2`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number, includeSign = false): string => {
  const formatted = `${Math.abs(value).toFixed(1).replace(".", ",")}%`;
  if (!includeSign) return formatted;
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted;
};
