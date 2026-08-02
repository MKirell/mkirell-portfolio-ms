import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { baseSchemaOptions, translationSchemaOptions } from '@/common/schemas/schema-options'

@Schema(translationSchemaOptions)
export class ProjectTranslation {
  @Prop({ required: true, trim: true })
  period: string

  @Prop({ required: true, trim: true })
  badge: string

  @Prop({ required: true, trim: true })
  desc: string
}

export const ProjectTranslationSchema = SchemaFactory.createForClass(ProjectTranslation)

@Schema({ ...baseSchemaOptions, collection: 'projects' })
export class Project {
  @Prop({ required: true, default: 0, min: 0 })
  order: number

  @Prop({ required: true, trim: true })
  title: string

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ type: String, default: null, trim: true })
  link: string | null

  @Prop({ type: Map, of: ProjectTranslationSchema, required: true })
  translations: Map<string, ProjectTranslation>
}

export type ProjectDocument = HydratedDocument<Project>
export const ProjectSchema = SchemaFactory.createForClass(Project)

ProjectSchema.index({ order: 1 })
