import { BadRequestException, NotFoundException } from '@nestjs/common'
import { FilterQuery, Model, Types } from 'mongoose'
import type { OrderedEntity, ReorderEntry } from '@/common/types/portfolio.types'
import { toPlain, toPlainList } from '@/common/utils/serialize'

export abstract class BaseCrudService<T extends OrderedEntity> {
  protected constructor(
    protected readonly model: Model<T>,
    protected readonly resourceName: string,
  ) {}

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    const found = await this.model.find(filter).sort({ order: 1, createdAt: 1 }).lean<T[]>().exec()
    return toPlainList(found)
  }

  async findOne(id: string): Promise<T> {
    this.assertObjectId(id)
    const found = await this.model.findById(id).lean<T>().exec()
    if (!found) throw new NotFoundException(`${this.resourceName} not found`)
    return toPlain(found)
  }

  async create(payload: object): Promise<T> {
    const order = (payload as Partial<OrderedEntity>).order ?? (await this.nextOrder())
    const created = await this.model.create({ ...payload, order })
    return created.toJSON() as T
  }

  async update(id: string, payload: object): Promise<T> {
    this.assertObjectId(id)
    const updated = await this.model
      .findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      .lean<T>()
      .exec()
    if (!updated) throw new NotFoundException(`${this.resourceName} not found`)
    return toPlain(updated)
  }

  async remove(id: string): Promise<void> {
    this.assertObjectId(id)
    const deleted = await this.model.findByIdAndDelete(id).lean<T>().exec()
    if (!deleted) throw new NotFoundException(`${this.resourceName} not found`)
  }

  async reorder(entries: ReorderEntry[]): Promise<T[]> {
    if (entries.length === 0) return this.findAll()

    const ids = entries.map((entry) => {
      this.assertObjectId(entry.id)
      return new Types.ObjectId(entry.id)
    })

    const existing = await this.model.countDocuments({ _id: { $in: ids } }).exec()
    if (existing !== entries.length) {
      throw new NotFoundException(`One or more ${this.resourceName} entries do not exist`)
    }

    const operations = entries.map((entry) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(entry.id) },
        update: { $set: { order: entry.order } },
      },
    }))
    await this.model.bulkWrite(operations as Parameters<Model<T>['bulkWrite']>[0])
    return this.findAll()
  }

  protected async nextOrder(): Promise<number> {
    const last = await this.model.findOne().sort({ order: -1 }).select('order').lean().exec()
    const current = (last as { order?: number } | null)?.order
    return typeof current === 'number' ? current + 1 : 0
  }

  protected assertObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Malformed ${this.resourceName} identifier`)
    }
  }
}
