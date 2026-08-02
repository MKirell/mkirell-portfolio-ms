import { PartialType } from '@nestjs/mapped-types'
import { IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator'
import { IsTranslationMap } from '@/common/dto/translations.dto'

export class AboutStatTranslationDto {
  @IsString()
  @MaxLength(120)
  label: string
}

export class CreateAboutStatDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number

  @IsString()
  @MaxLength(20)
  num: string

  @IsOptional()
  @IsString()
  @Matches(/^#[a-z0-9-]+$/i)
  anchor?: string | null

  @IsTranslationMap(AboutStatTranslationDto)
  translations: Record<string, AboutStatTranslationDto>
}

export class UpdateAboutStatDto extends PartialType(CreateAboutStatDto) {}
