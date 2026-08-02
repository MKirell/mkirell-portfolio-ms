import { PartialType } from '@nestjs/mapped-types'
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator'
import { IsTranslationMap } from '@/common/dto/translations.dto'

export class ExperienceTranslationDto {
  @IsString()
  @MaxLength(120)
  period: string

  @IsString()
  @MaxLength(200)
  role: string

  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  bullets: string[]
}

export class CreateExperienceDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number

  @IsOptional()
  @IsBoolean()
  current?: boolean

  @IsString()
  @MaxLength(200)
  company: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  tags?: string[]

  @IsOptional()
  @IsString()
  @MaxLength(255)
  doc?: string | null

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  link?: string | null

  @IsTranslationMap(ExperienceTranslationDto)
  translations: Record<string, ExperienceTranslationDto>
}

export class UpdateExperienceDto extends PartialType(CreateExperienceDto) {}
