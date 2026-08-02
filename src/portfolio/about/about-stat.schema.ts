import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { baseSchemaOptions, translationSchemaOptions } from '@/common/schemas/schema-options'

@Schema(translationSchemaOptions)
export class AboutStatTranslation {
  @Prop({ required: true, trim: true })
  label: string
}

export const AboutStatTranslationSchema = SchemaFactory.createForClass(AboutStatTranslation)

@Schema({ ...baseSchemaOptions, collection: 'about_stats' })
export class AboutStat {
  @Prop({ required: true, default: 0, min: 0 })
  order: number

  @Prop({ required: true, trim: true })
  num: string

  @Prop({ type: String, default: null, trim: true })
  anchor: string | null

  @Prop({ type: Map, of: AboutStatTranslationSchema, required: true })
  translations: Map<string, AboutStatTranslation>
}

export type AboutStatDocument = HydratedDocument<AboutStat>
export const AboutStatSchema = SchemaFactory.createForClass(AboutStat)

AboutStatSchema.index({ order: 1 })
