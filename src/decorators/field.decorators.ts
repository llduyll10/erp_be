import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNumber, IsOptional, Min, Max, IsEnum } from 'class-validator';

export interface StringFieldOptions {
  minLength?: number;
  maxLength?: number;
  optional?: boolean;
  enum?: any;
  description?: string;
  example?: string;
  trim?: boolean;
}

export interface NumberFieldOptions {
  min?: number;
  max?: number;
  optional?: boolean;
  description?: string;
  example?: number;
}

export function StringField(options: StringFieldOptions = {}) {
  const decorators = [IsString()];

  if (options.minLength) {
    decorators.push(Min(options.minLength));
  }

  if (options.maxLength) {
    decorators.push(Max(options.maxLength));
  }

  if (options.enum) {
    decorators.push(IsEnum(options.enum));
  }

  if (options.trim) {
    decorators.push(Transform(({ value }) => value?.trim()));
  }

  if (options.optional) {
    decorators.push(IsOptional());
    decorators.push(
      ApiPropertyOptional({
        type: String,
        enum: options.enum,
        description: options.description,
        example: options.example,
      }),
    );
  } else {
    decorators.push(
      ApiProperty({
        type: String,
        enum: options.enum,
        description: options.description,
        example: options.example,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function NumberField(options: NumberFieldOptions = {}) {
  const decorators = [IsNumber()];

  if (typeof options.min === 'number') {
    decorators.push(Min(options.min));
  }

  if (typeof options.max === 'number') {
    decorators.push(Max(options.max));
  }

  if (options.optional) {
    decorators.push(IsOptional());
    decorators.push(
      ApiPropertyOptional({
        type: Number,
        minimum: options.min,
        maximum: options.max,
        description: options.description,
        example: options.example,
      }),
    );
  } else {
    decorators.push(
      ApiProperty({
        type: Number,
        minimum: options.min,
        maximum: options.max,
        description: options.description,
        example: options.example,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export const StringFieldOptional = (options: StringFieldOptions = {}) =>
  StringField({ ...options, optional: true });

export const NumberFieldOptional = (options: NumberFieldOptions = {}) =>
  NumberField({ ...options, optional: true }); 