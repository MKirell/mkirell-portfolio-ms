import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { baseSchemaOptions, translationSchemaOptions } from '@/common/schemas/schema-options'

@Schema(translationSchemaOptions)
export class SpokenLanguageTranslation {
  @Prop({ required: true, trim: true })
  name: string

  @Prop({ required: true, trim: true })
  level: string
}

export const SpokenLanguageTranslationSchema =
  SchemaFactory.createForClass(SpokenLanguageTranslation)

@Schema({ ...baseSchemaOptions, collection: 'spoken_languages' })
export class SpokenLanguage {
  @Prop({ required: true, default: 0, min: 0 })
  order: number

  @Prop({ required: true, trim: true })
  flagCode: string

  @Prop({ required: true, min: 0, max: 100 })
  pct: number

  @Prop({ type: String, default: null, trim: true })
  doc: string | null

  @Prop({ type: Map, of: SpokenLanguageTranslationSchema, required: true })
  translations: Map<string, SpokenLanguageTranslation>
}

export type SpokenLanguageDocument = HydratedDocument<SpokenLanguage>
export const SpokenLanguageSchema = SchemaFactory.createForClass(SpokenLanguage)

SpokenLanguageSchema.index({ order: 1 })
