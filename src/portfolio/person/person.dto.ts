import { PartialType } from '@nestjs/mapped-types'
import { IsEmail, IsObject, IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator'
import { IsTranslationMap } from '@/common/dto/translations.dto'

export class PersonTranslationDto {
  @IsString()
  @MaxLength(200)
  jobTitle: string

  @IsString()
  @MaxLength(2000)
  description: string

  @IsString()
  @MaxLength(120)
  addressLocality: string

  @IsString()
  @MaxLength(120)
  addressRegion: string

  @IsString()
  @MaxLength(120)
  addressCountryName: string
}

export class UpsertPersonDto {
  @IsString()
  @MaxLength(200)
  name: string

  @IsString()
  @MaxLength(120)
  givenName: string

  @IsString()
  @MaxLength(120)
  familyName: string

  @IsString()
  @MaxLength(80)
  brand: string

  @IsEmail()
  professionalEmail: string

  @IsEmail()
  organizationEmail: string

  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/)
  phone: string

  @IsString()
  @MaxLength(40)
  phoneDisplay: string

  @IsUrl({ protocols: ['https'], require_protocol: true })
  linkedin: string

  @IsString()
  @MaxLength(120)
  linkedinHandle: string

  @IsUrl({ protocols: ['https'], require_protocol: true })
  github: string

  @IsUrl({ protocols: ['https'], require_protocol: true })
  url: string

  @IsString()
  @MaxLength(200)
  worksFor: string

  @IsString()
  @Matches(/^[A-Z]{2}$/)
  addressCountry: string

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  mapsUrl: string

  @IsString()
  @MaxLength(255)
  photo: string

  @IsString()
  @MaxLength(255)
  logoLightTheme: string

  @IsString()
  @MaxLength(255)
  logoDarkTheme: string

  @IsOptional()
  @IsObject()
  resumes?: Record<string, string>

  @IsTranslationMap(PersonTranslationDto)
  translations: Record<string, PersonTranslationDto>
}

export class UpdatePersonDto extends PartialType(UpsertPersonDto) {}
