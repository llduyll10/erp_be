import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export function StringField(options: {
  minLength?: number;
  maxLength?: number;
  optional?: boolean;
  swagger?: boolean;
  trim?: boolean;
} = {}) {
  const decorators = [IsString()];

  if (options.minLength) {
    decorators.push(MinLength(options.minLength));
  }

  if (options.maxLength) {
    decorators.push(MaxLength(options.maxLength));
  }

  if (options.optional) {
    decorators.push(IsOptional());
  }

  if (options.trim) {
    decorators.push(Transform(({ value }) => value?.trim()));
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({
        type: String,
        required: !options.optional,
        minLength: options.minLength,
        maxLength: options.maxLength,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function NumberField(options: {
  min?: number;
  max?: number;
  optional?: boolean;
  swagger?: boolean;
} = {}) {
  const decorators = [IsNumber()];

  if (options.optional) {
    decorators.push(IsOptional());
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({
        type: Number,
        required: !options.optional,
        minimum: options.min,
        maximum: options.max,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function EmailField(options: {
  optional?: boolean;
  swagger?: boolean;
} = {}) {
  const decorators = [
    IsEmail(),
    Transform(({ value }) => value?.toLowerCase().trim()),
  ];

  if (options.optional) {
    decorators.push(IsOptional());
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({
        type: String,
        required: !options.optional,
        format: 'email',
      }),
    );
  }

  return applyDecorators(...decorators);
} 