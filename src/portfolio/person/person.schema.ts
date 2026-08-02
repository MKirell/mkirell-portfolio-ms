import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { baseSchemaOptions, translationSchemaOptions } from '@/common/schemas/schema-options'

@Schema(translationSchemaOptions)
export class PersonTranslation {
  @Prop({ required: true, trim: true })
  jobTitle: string

  @Prop({ required: true, trim: true })
  description: string

  @Prop({ required: true, trim: true })
  addressLocality: string

  @Prop({ required: true, trim: true })
  addressRegion: string

  @Prop({ required: true, trim: true })
  addressCountryName: string
}

export const PersonTranslationSchema = SchemaFactory.createForClass(PersonTranslation)

@Schema({ ...baseSchemaOptions, collection: 'person' })
export class Person {
  @Prop({ required: true, unique: true, default: 'primary' })
  key: string

  @Prop({ required: true, trim: true })
  name: string

  @Prop({ required: true, trim: true })
  givenName: string

  @Prop({ required: true, trim: true })
  familyName: string

  @Prop({ required: true, trim: true })
  brand: string

  @Prop({ required: true, trim: true, lowercase: true })
  professionalEmail: string

  @Prop({ required: true, trim: true, lowercase: true })
  organizationEmail: string

  @Prop({ required: true, trim: true })
  phone: string

  @Prop({ required: true, trim: true })
  phoneDisplay: string

  @Prop({ required: true, trim: true })
  linkedin: string

  @Prop({ required: true, trim: true })
  linkedinHandle: string

  @Prop({ required: true, trim: true })
  github: string

  @Prop({ required: true, trim: true })
  url: string

  @Prop({ required: true, trim: true })
  worksFor: string

  @Prop({ required: true, trim: true, uppercase: true })
  addressCountry: string

  @Prop({ required: true, trim: true })
  mapsUrl: string

  @Prop({ required: true, trim: true })
  photo: string

  @Prop({ required: true, trim: true })
  logoLightTheme: string

  @Prop({ required: true, trim: true })
  logoDarkTheme: string

  @Prop({ type: Map, of: String, default: () => new Map<string, string>() })
  resumes: Map<string, string>

  @Prop({ type: Map, of: PersonTranslationSchema, required: true })
  translations: Map<string, PersonTranslation>
}

export type PersonDocument = HydratedDocument<Person>
export const PersonSchema = SchemaFactory.createForClass(Person)
