import { PartialType } from '@nestjs/mapped-types'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator'

export class ShellHelpItemDto {
  @IsString()
  @MaxLength(80)
  cmd: string

  @IsString()
  @MaxLength(200)
  desc: string
}

export class HeroStringsDto {
  @IsString()
  @MaxLength(200)
  title: string

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  subtitles: string[]

  @IsString()
  @MaxLength(200)
  cardRole: string

  @IsString()
  @MaxLength(2000)
  desc: string

  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  skills: string[]

  @IsOptional()
  @IsString()
  @MaxLength(80)
  skillHighlight?: string

  @IsObject()
  cta: Record<string, string>

  @IsObject()
  card: Record<string, string>
}

export class ShellStringsDto {
  @IsString()
  @MaxLength(80)
  promptUser: string

  @IsString()
  @MaxLength(80)
  promptHost: string

  @IsString()
  @MaxLength(200)
  placeholder: string

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  welcome: string[]

  @IsString()
  @MaxLength(300)
  helpIntro: string

  @IsArray()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => ShellHelpItemDto)
  helpItems: ShellHelpItemDto[]

  @IsOptional()
  @IsString()
  @MaxLength(300)
  helpFooter?: string

  @IsObject()
  messages: Record<string, string>
}

export class UpsertUiStringsDto {
  @IsObject()
  nav: Record<string, string>

  @IsObject()
  headings: Record<string, string>

  @IsObject()
  labels: Record<string, string>

  @ValidateNested()
  @Type(() => HeroStringsDto)
  hero: HeroStringsDto

  @ValidateNested()
  @Type(() => ShellStringsDto)
  shell: ShellStringsDto

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(3000, { each: true })
  aboutParagraphs: string[]

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  contactDesc?: string

  @IsOptional()
  @IsString()
  @MaxLength(300)
  footerCopy?: string
}

export class UpdateUiStringsDto extends PartialType(UpsertUiStringsDto) {}
