import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsPositive,
  IsEnum,
  IsBoolean,
  IsDate,
  IsUrl,
  IsEmail,
  Matches,
  Equals,
  MinDate,
  MaxDate,
  ArrayMaxSize,
  ArrayMinSize,
  IsObject,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { isNumber } from 'lodash';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsFile, MaxFileSize } from 'nestjs-form-data';
import { IsEqualTo } from 'src/shared/validators/is-equal-to.validator';
import { HasMimeType } from 'src/shared/validators/has-mime-type.validator';
import { ToArray } from './transform.decorator';
import {
  ToBoolean,
  ToLowerCase,
  ToUpperCase,
  Trim,
} from './transform.decorator';

interface IStringFieldOptions {
  length?: number;
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  allowEmpty?: boolean;
  email?: boolean;
  url?: boolean;
  regex?: { pattern: string | RegExp; message?: string };
  equalTo?: string;
  password?: boolean;
  noTrim?: boolean;
}
interface INumberFieldOptions {
  each?: boolean;
  minimum?: number;
  maximum?: number;
  int?: boolean;
  isPositive?: boolean;
  equal?: boolean;
}

interface IDateFieldOptions {
  minDate?: Date | string;
  maxDate?: Date | string;
  inPast?: boolean;
  inFuture?: boolean;
}

export type SupportFileType =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'csv'
  | 'word'
  | 'excel'
  | 'json';

interface IFileFieldOptions {
  fileSize?: number;
  fileTypes?: string[];
  maxCount?: number;
  minCount?: number;
  each?: boolean;
}

/* eslint-disable complexity */
export function StringField(
  options: IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    IsString({ message: i18nValidationMessage('validation.IsString') }),
  ];

  if (!options.noTrim) {
    decorators.push(Trim());
  }

  if (!options.allowEmpty) {
    decorators.push(
      IsNotEmpty({
        message: i18nValidationMessage('model.validation.messages.blank'),
      }),
    );
  }

  if (options?.length) {
    decorators.push(
      MinLength(options.length, {
        message: i18nValidationMessage('model.validation.messages.too_short', {
          count: options.length,
        }),
      }),
    );
    decorators.push(
      MaxLength(options.length, {
        message: i18nValidationMessage('model.validation.messages.too_long', {
          count: options.length,
        }),
      }),
    );
  }

  if (options?.minLength) {
    decorators.push(
      MinLength(options.minLength, {
        message: i18nValidationMessage('model.validation.messages.too_short', {
          count: options.minLength,
        }),
      }),
    );
  }

  if (options?.maxLength) {
    decorators.push(
      MaxLength(options.maxLength, {
        message: i18nValidationMessage('model.validation.messages.too_long', {
          count: options.maxLength,
        }),
      }),
    );
  }

  if (options.url) {
    decorators.push(
      IsUrl(),
    );
  }

  if (options.email) {
    decorators.push(
      IsEmail(),
    );
  }

  if (options?.regex) {
    decorators.push(
      Matches(
        typeof options?.regex.pattern === 'string'
          ? new RegExp(options?.regex.pattern)
          : options?.regex.pattern,
        {
          message:
            options.regex.message ||
            i18nValidationMessage('model.validation.messages.invalid'),
        },
      ),
    );
  }

  if (options.equalTo) {
    decorators.push(
      IsEqualTo(options.equalTo, {
        message: i18nValidationMessage('validation.IsEqualTo'),
      }),
    );
  }


  if (options?.toLowerCase) {
    decorators.push(ToLowerCase());
  }

  if (options?.toUpperCase) {
    decorators.push(ToUpperCase());
  }

  return applyDecorators(...decorators);
}

export function StringFieldOptional(
  options: IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    StringField({ allowEmpty: true, ...options }),
  );
}

export function NumberField(
  options: INumberFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => Number)];

  const { each, int, minimum, maximum, isPositive, equal } = options;

  if (int) {
    decorators.push(
      IsInt({
        each,
        message: i18nValidationMessage(
          'model.validation.messages.not_an_integer',
        ),
      }),
    );
  } else {
    decorators.push(
      IsNumber(
        {},
        { each, message: i18nValidationMessage('validation.IsNumber') },
      ),
    );
  }

  if (isNumber(minimum)) {
    decorators.push(
      Min(minimum, {
        each,
        message: i18nValidationMessage(
          'model.validation.messages.greater_than',
          {
            count: minimum,
          },
        ),
      }),
    );
  }

  if (isNumber(maximum)) {
    decorators.push(
      Max(maximum, {
        each,
        message: i18nValidationMessage('model.validation.messages.less_than', {
          count: maximum,
        }),
      }),
    );
  }

  if (isPositive) {
    decorators.push(
      IsPositive({
        each,
        message: i18nValidationMessage('validation.IsPositive'),
      }),
    );
  }

  if (equal) {
    decorators.push(
      Equals(equal, {
        each,
        message: i18nValidationMessage('validation.Equals'),
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function NumberFieldOptional(
  options: INumberFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsOptional(), NumberField({ ...options }));
}

export function EnumField<TEnum>(
  getEnum: () => TEnum,
  options: Partial<{ each: boolean }> = {},
): PropertyDecorator {
  const enumValue = getEnum() as unknown;
  const decorators = [
    IsEnum(enumValue as object, {
      each: options?.each,
      message: i18nValidationMessage('validation.IsEnum', {
        enum: Object.values(enumValue as object),
      }),
    }),
  ];

  if (options.each) {
    decorators.push(ToArray());
  }

  return applyDecorators(...decorators);
}

export function EnumFieldOptional<TEnum>(
  getEnum: () => TEnum,
  options: Partial<{ each: boolean }> = {},
): PropertyDecorator {
  return applyDecorators(IsOptional(), EnumField(getEnum, { ...options }));
}

export function BooleanField(options: Partial<{}> = {}): PropertyDecorator {
  const decorators = [
    IsBoolean({ message: i18nValidationMessage('validation.IsBoolean') }),
    ToBoolean(),
  ];

  return applyDecorators(...decorators);
}

export function BooleanFieldOptional(
  options: Partial<{}> = {},
): PropertyDecorator {
  return applyDecorators(IsOptional(), BooleanField({ ...options }));
}

export function DateField(options: IDateFieldOptions): PropertyDecorator {
  const decorators = [Type(() => Date), IsDate()];

  if (options.inPast) {
    decorators.push(
      MaxDate(new Date(), {
        message: i18nValidationMessage(
          'model.validation.messages.datetime_in_past',
        ),
      }),
    );
  }
  if (options.inFuture) {
    decorators.push(
      MinDate(new Date(), {
        message: i18nValidationMessage(
          'model.validation.messages.datetime_in_future',
        ),
      }),
    );
  }
  if (options.minDate) {
    decorators.push(
      MinDate(
        typeof options.minDate === 'string'
          ? new Date(options.minDate)
          : options.minDate,
        {
          message: i18nValidationMessage(
            'model.validation.messages.datetime_in_future',
          ),
        },
      ),
    );
  }

  if (options.maxDate) {
    decorators.push(
      MaxDate(
        typeof options.maxDate === 'string'
          ? new Date(options.maxDate)
          : options.maxDate,
        {
          message: i18nValidationMessage(
            'model.validation.messages.datetime_in_past',
          ),
        },
      ),
    );
  }

  return applyDecorators(...decorators);
}

export function DateFieldOptional(options = {}): PropertyDecorator {
  return applyDecorators(IsOptional(), DateField({ ...options }));
}

export function FileField(options?: IFileFieldOptions): PropertyDecorator {
  return (target, propertyKey) => {
    const {
      fileSize = 0,
      fileTypes = [],
      maxCount = 0,
      minCount = 0,
      each = false
    } = options || {};

    const decorators = [
      ApiProperty({ type: 'string', format: 'binary' }),
      IsFile({ each, message: i18nValidationMessage('validation.IsFile') }),
    ];

    if (fileTypes.length > 0) {
      decorators.push(
        HasMimeType(fileTypes, {
          each,
          message: i18nValidationMessage(
            'model.validation.messages.file_content_type_invalid',
          ),
        }),
      );
    }

    if (fileSize > 0) {
      decorators.push(
        MaxFileSize(fileSize * 1000000, {
          each,
          message: i18nValidationMessage(
            'model.validation.messages.file_size_out_of_range',
          ),
        }),
      );
    }

    if (maxCount > 0) {
      decorators.push(
        ArrayMaxSize(maxCount, {
          message: i18nValidationMessage(
            'model.validation.messages.file_limit_out_of_range',
          ),
        }),
      );
    }

    if (minCount > 0) {
      decorators.push(
        ArrayMinSize(minCount, {
          message: i18nValidationMessage(
            'model.validation.messages.file_limit_out_of_range',
          ),
        }),
      );
    }

    return applyDecorators(...decorators);
  };
}

export function FileFieldOptional(
  options?: IFileFieldOptions,
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    FileField(options),
  );
}

export function ObjectField(type?: Function): PropertyDecorator {
  const decorators = [
    IsObject({ message: i18nValidationMessage('validation.IsObject') }),
  ];

  if (type) {
    decorators.push(
      Type(() => type),
      ValidateNested(),
    );
  }

  return applyDecorators(...decorators);
}

export function ObjectFieldOptional(type?: Function): PropertyDecorator {
  return applyDecorators(IsOptional(), ObjectField(type));
}

export function ArrayField(type?: Function): PropertyDecorator {
  const decorators = [
    IsArray({ message: i18nValidationMessage('validation.IsArray') }),
  ];

  if (type) {
    decorators.push(
      Type(() => type),
      ValidateNested({ each: true }),
    );
  }

  return applyDecorators(...decorators);
}

export function ArrayFieldOptional(type?: Function): PropertyDecorator {
  return applyDecorators(IsOptional(), ObjectField(type));
}

export function TransformToNullWhenEmpty(): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }) => {
      return value === '[]' || value === '' ? null : value;
    }),
  );
}
