import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { baseSchemaOptions, translationSchemaOptions } from '@/common/schemas/schema-options'
import { LANG_PATTERN } from '@/common/types/portfolio.types'

@Schema(translationSchemaOptions)
export class ShellHelpItem {
  @Prop({ required: true, trim: true })
  cmd: string

  @Prop({ required: true, trim: true })
  desc: string
}

export const ShellHelpItemSchema = SchemaFactory.createForClass(ShellHelpItem)

@Schema(translationSchemaOptions)
export class HeroStrings {
  @Prop({ required: true, trim: true })
  title: string

  @Prop({ type: [String], default: [] })
  subtitles: string[]

  @Prop({ required: true, trim: true })
  cardRole: string

  @Prop({ required: true, trim: true })
  desc: string

  @Prop({ type: [String], default: [] })
  skills: string[]

  @Prop({ trim: true, default: '' })
  skillHighlight: string

  @Prop({ type: Map, of: String, default: () => new Map<string, string>() })
  cta: Map<string, string>

  @Prop({ type: Map, of: String, default: () => new Map<string, string>() })
  card: Map<string, string>
}

export const HeroStringsSchema = SchemaFactory.createForClass(HeroStrings)

@Schema(translationSchemaOptions)
export class ShellStrings {
  @Prop({ required: true, trim: true })
  promptUser: string

  @Prop({ required: true, trim: true })
  promptHost: string

  @Prop({ required: true, trim: true })
  placeholder: string

  @Prop({ type: [String], default: [] })
  welcome: string[]

  @Prop({ required: true, trim: true })
  helpIntro: string

  @Prop({ type: [ShellHelpItemSchema], default: [] })
  helpItems: ShellHelpItem[]

  @Prop({ trim: true, default: '' })
  helpFooter: string

  @Prop({ type: Map, of: String, default: () => new Map<string, string>() })
  messages: Map<string, string>
}

export const ShellStringsSchema = SchemaFactory.createForClass(ShellStrings)

@Schema({ ...baseSchemaOptions, collection: 'ui_strings' })
export class UiStrings {
  @Prop({ required: true, unique: true, trim: true, match: LANG_PATTERN })
  lang: string

  @Prop({ type: Map, of: String, default: () => new Map<string, string>() })
  nav: Map<string, string>

  @Prop({ type: Map, of: String, default: () => new Map<string, string>() })
  headings: Map<string, string>

  @Prop({ type: Map, of: String, default: () => new Map<string, string>() })
  labels: Map<string, string>

  @Prop({ type: HeroStringsSchema, required: true })
  hero: HeroStrings

  @Prop({ type: ShellStringsSchema, required: true })
  shell: ShellStrings

  @Prop({ type: [String], default: [] })
  aboutParagraphs: string[]

  @Prop({ trim: true, default: '' })
  contactDesc: string

  @Prop({ trim: true, default: '' })
  footerCopy: string
}

export type UiStringsDocument = HydratedDocument<UiStrings>
export const UiStringsSchema = SchemaFactory.createForClass(UiStrings)
