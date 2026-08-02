import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { baseSchemaOptions, translationSchemaOptions } from '@/common/schemas/schema-options'

@Schema(translationSchemaOptions)
export class AwardTranslation {
  @Prop({ required: true, trim: true })
  title: string

  @Prop({ type: String, default: null, trim: true })
  place: string | null

  @Prop({ type: String, default: null, trim: true })
  date: string | null
}

export const AwardTranslationSchema = SchemaFactory.createForClass(AwardTranslation)

@Schema({ ...baseSchemaOptions, collection: 'awards' })
export class Award {
  @Prop({ required: true, default: 0, min: 0 })
  order: number

  @Prop({ required: true, trim: true })
  icon: string

  @Prop({ type: String, default: null, trim: true })
  flagCode: string | null

  @Prop({ type: [String], default: [] })
  images: string[]

  @Prop({ type: String, default: null, trim: true })
  doc: string | null

  @Prop({ type: Map, of: AwardTranslationSchema, required: true })
  translations: Map<string, AwardTranslation>
}

export type AwardDocument = HydratedDocument<Award>
export const AwardSchema = SchemaFactory.createForClass(Award)

AwardSchema.index({ order: 1 })
