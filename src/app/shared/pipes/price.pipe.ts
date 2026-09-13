import { Pipe, PipeTransform } from '@angular/core';

const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(currency: string): Intl.NumberFormat {
  let formatter = formatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    formatters.set(currency, formatter);
  }
  return formatter;
}

/** Formats a price in Uruguayan locale, e.g. `2500` + `UYU` → `$ 2.500`. */
@Pipe({ name: 'appPrice' })
export class PricePipe implements PipeTransform {
  transform(value: number, currency = 'UYU'): string {
    return formatterFor(currency).format(value);
  }
}
