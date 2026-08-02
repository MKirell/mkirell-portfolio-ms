import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { baseSchemaOptions } from '@/common/schemas/schema-options'
import { LANG_PATTERN } from '@/common/types/portfolio.types'

@Schema({ ...baseSchemaOptions, collection: 'locales' })
export class Locale {
  @Prop({ required: true, unique: true, trim: true, match: LANG_PATTERN })
  code: string

  @Prop({ required: true, trim: true })
  label: string

  @Prop({ required: true, trim: true })
  flagCode: string

  @Prop({ required: true, default: true })
  enabled: boolean

  @Prop({ required: true, default: 0, min: 0 })
  order: number
}

export type LocaleDocument = HydratedDocument<Locale>
export const LocaleSchema = SchemaFactory.createForClass(Locale)

LocaleSchema.index({ order: 1 })
