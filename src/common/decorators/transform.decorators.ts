import { Transform } from 'class-transformer';

export function ToBoolean(): PropertyDecorator {
  return Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1) return true;
    if (value === 'false' || value === false || value === 0) return false;
    return value;
  });
}

export function ToNumber(): PropertyDecorator {
  return Transform(({ value }) => {
    const val = Number(value);
    return Number.isNaN(val) ? value : val;
  });
}

export function ToArray(): PropertyDecorator {
  return Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(item => item.trim());
    return value;
  });
}

export function ToLowerCase(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value === 'string') return value.toLowerCase();
    return value;
  });
}

export function ToUpperCase(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value === 'string') return value.toUpperCase();
    return value;
  });
} 