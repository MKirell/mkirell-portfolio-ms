import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UiStrings } from '@/portfolio/ui-strings/ui-strings.schema'
import { toPlain, toPlainList } from '@/common/utils/serialize'
import type { UpdateUiStringsDto, UpsertUiStringsDto } from '@/portfolio/ui-strings/ui-strings.dto'

@Injectable()
export class UiStringsService {
  constructor(@InjectModel(UiStrings.name) private readonly model: Model<UiStrings>) {}

  async findAll(): Promise<UiStrings[]> {
    const found = await this.model.find().sort({ lang: 1 }).lean<UiStrings[]>().exec()
    return toPlainList(found)
  }

  async findByLang(lang: string): Promise<UiStrings> {
    const found = await this.model.findOne({ lang }).lean<UiStrings>().exec()
    if (!found) throw new NotFoundException(`No interface copy stored for "${lang}"`)
    return toPlain(found)
  }

  async upsert(lang: string, payload: UpsertUiStringsDto): Promise<UiStrings> {
    const saved = await this.model
      .findOneAndUpdate(
        { lang },
        { $set: { ...payload, lang } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      )
      .lean<UiStrings>()
      .exec()
    return toPlain(saved)
  }

  async update(lang: string, payload: UpdateUiStringsDto): Promise<UiStrings> {
    const updated = await this.model
      .findOneAndUpdate({ lang }, { $set: payload }, { new: true, runValidators: true })
      .lean<UiStrings>()
      .exec()
    if (!updated) throw new NotFoundException(`No interface copy stored for "${lang}"`)
    return toPlain(updated)
  }

  async remove(lang: string): Promise<void> {
    const deleted = await this.model.findOneAndDelete({ lang }).lean<UiStrings>().exec()
    if (!deleted) throw new NotFoundException(`No interface copy stored for "${lang}"`)
  }
}
