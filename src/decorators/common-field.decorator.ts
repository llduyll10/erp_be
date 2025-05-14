import { applyDecorators } from '@nestjs/common';
import {
  IsDate,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Trim } from './transform.decorator';
import {
  DIGIT_WITH_HYPHEN_OR_EMPTY_STRING_REGEX,
  DIGIT_WITH_HYPHEN_REGEX,
  POSTAL_CODE_REGEX,
  REGEX_POSTAL_CODE_OR_EMPTY,
} from '@/constants/index';

export function IsPostalCode(): PropertyDecorator {
  const decorators = [
    IsString({
      message: i18nValidationMessage('validation.IsString'),
    }),
    Trim(),
    Matches(POSTAL_CODE_REGEX, {
      message: i18nValidationMessage('validation.invalid_postal_code'),
    }),
  ];
  return applyDecorators(...decorators);
}

export function IsPostalCodeOptional(): PropertyDecorator {
  const decorators = [
    IsOptional(),
    Transform(({ value }) =>
      value === null || value === undefined ? value : value.trim(),
    ),
    IsString({
      message: i18nValidationMessage('validation.IsString'),
    }),
    Matches(REGEX_POSTAL_CODE_OR_EMPTY, {
      message: i18nValidationMessage('validation.invalid_postal_code'),
    }),
  ];
  return applyDecorators(...decorators);
}

export function IsPhoneNumber(): PropertyDecorator {
  const decorators = [
    IsString({
      message: i18nValidationMessage('validation.IsString'),
    }),
    Trim(),
    MaxLength(30, { message: i18nValidationMessage('validation.MaxLength') }),
    Matches(DIGIT_WITH_HYPHEN_REGEX, {
      message: i18nValidationMessage('validation.invalid_phone_number'),
    }),
  ];
  return applyDecorators(...decorators);
}

export function IsPhoneNumberOptional(): PropertyDecorator {
  const decorators = [
    IsOptional(),
    Transform(({ value }) =>
      value === null || value === undefined ? value : value.trim(),
    ),
    IsString({
      message: i18nValidationMessage('validation.IsString'),
    }),
    MaxLength(30, { message: i18nValidationMessage('validation.MaxLength') }),
    Matches(DIGIT_WITH_HYPHEN_OR_EMPTY_STRING_REGEX, {
      message: i18nValidationMessage('validation.invalid_phone_number'),
    }),
  ];
  return applyDecorators(...decorators);
}

export function IsEmail(): PropertyDecorator {
  const decorators = [
    Transform(({ value }) =>
      value === null || value === undefined ? value : value.trim(),
    ),
    IsString({
      message: i18nValidationMessage('validation.IsString'),
    }),
    Matches(/^(?:[^\s@]+@[^\s@]+\.[^\s@]+)?$/, {
      message: i18nValidationMessage('validation.invalid_email'),
    }),
  ];
  return applyDecorators(...decorators);
}

export function IsDateOptional(): PropertyDecorator {
  const decorators = [
    IsOptional(),
    Transform(({ value }) => {
      if (value === null || value === undefined || value === '') {
        return null;
      }

      try {
        return new Date(value);
      } catch (error) {
        return null;
      }
    }),
    IsDate({
      message: i18nValidationMessage('validation.IsDate'),
    }),
  ];

  return applyDecorators(...decorators);
}
