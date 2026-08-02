import { PartialType } from '@nestjs/mapped-types'
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { IsTranslationMap } from '@/common/dto/translations.dto'

export class CertificationTranslationDto {
  @IsString()
  @MaxLength(60)
  date: string
}

export class CreateCertificationDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number

  @IsString()
  @MaxLength(60)
  icon: string

  @IsString()
  @MaxLength(200)
  title: string

  @IsString()
  @MaxLength(200)
  issuer: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  doc?: string | null

  @IsTranslationMap(CertificationTranslationDto)
  translations: Record<string, CertificationTranslationDto>
}

export class UpdateCertificationDto extends PartialType(CreateCertificationDto) {}
