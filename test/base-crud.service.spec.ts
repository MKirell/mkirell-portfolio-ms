import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Model, Types } from 'mongoose'
import { BaseCrudService } from '@/common/services/base-crud.service'

interface Widget {
  order: number
  label?: string
}

class WidgetService extends BaseCrudService<Widget> {
  constructor(model: Model<Widget>) {
    super(model, 'Widget')
  }
}

function chain<T>(value: T) {
  return {
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  }
}

const VALID_ID = '507f1f77bcf86cd799439011'

describe('BaseCrudService', () => {
  let model: {
    find: jest.Mock
    findOne: jest.Mock
    findById: jest.Mock
    findByIdAndUpdate: jest.Mock
    findByIdAndDelete: jest.Mock
    countDocuments: jest.Mock
    bulkWrite: jest.Mock
    create: jest.Mock
  }
  let service: WidgetService

  beforeEach(() => {
    model = {
      find: jest.fn().mockReturnValue(chain([{ order: 0 }])),
      findOne: jest.fn().mockReturnValue(chain(null)),
      findById: jest.fn().mockReturnValue(chain({ order: 0 })),
      findByIdAndUpdate: jest.fn().mockReturnValue(chain({ order: 0, label: 'updated' })),
      findByIdAndDelete: jest.fn().mockReturnValue(chain({ order: 0 })),
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(1) }),
      bulkWrite: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockImplementation((doc: Widget) => Promise.resolve({ toJSON: () => doc })),
    }
    service = new WidgetService(model as unknown as Model<Widget>)
  })

  describe('findAll', () => {
    it('returns entries sorted by explicit order', async () => {
      await service.findAll()

      expect(model.find).toHaveBeenCalledWith({})
      expect(model.find.mock.results[0].value.sort).toHaveBeenCalledWith({
        order: 1,
        createdAt: 1,
      })
    })

    it('passes a filter straight through', async () => {
      await service.findAll({ label: 'x' })

      expect(model.find).toHaveBeenCalledWith({ label: 'x' })
    })
  })

  describe('findOne', () => {
    it('returns the matching entry', async () => {
      await expect(service.findOne(VALID_ID)).resolves.toEqual({ order: 0 })
    })

    it('rejects a malformed id before querying', async () => {
      await expect(service.findOne('nope')).rejects.toBeInstanceOf(BadRequestException)
      expect(model.findById).not.toHaveBeenCalled()
    })

    it('reports a missing entry by resource name', async () => {
      model.findById.mockReturnValue(chain(null))

      await expect(service.findOne(VALID_ID)).rejects.toThrow('Widget not found')
    })
  })

  describe('create', () => {
    it('appends after the current highest order', async () => {
      model.findOne.mockReturnValue(chain({ order: 4 }))

      await service.create({ label: 'new' })

      expect(model.create).toHaveBeenCalledWith({ label: 'new', order: 5 })
    })

    it('starts at zero on an empty collection', async () => {
      model.findOne.mockReturnValue(chain(null))

      await service.create({ label: 'first' })

      expect(model.create).toHaveBeenCalledWith({ label: 'first', order: 0 })
    })

    it('honours an explicitly supplied order', async () => {
      await service.create({ label: 'pinned', order: 2 })

      expect(model.create).toHaveBeenCalledWith({ label: 'pinned', order: 2 })
      expect(model.findOne).not.toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('runs schema validators on the update', async () => {
      await service.update(VALID_ID, { label: 'updated' })

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        VALID_ID,
        { label: 'updated' },
        { new: true, runValidators: true },
      )
    })

    it('rejects a malformed id', async () => {
      await expect(service.update('nope', {})).rejects.toBeInstanceOf(BadRequestException)
    })

    it('reports a missing entry', async () => {
      model.findByIdAndUpdate.mockReturnValue(chain(null))

      await expect(service.update(VALID_ID, {})).rejects.toBeInstanceOf(NotFoundException)
    })
  })

  describe('remove', () => {
    it('deletes an existing entry', async () => {
      await expect(service.remove(VALID_ID)).resolves.toBeUndefined()
    })

    it('rejects a malformed id', async () => {
      await expect(service.remove('nope')).rejects.toBeInstanceOf(BadRequestException)
    })

    it('reports a missing entry', async () => {
      model.findByIdAndDelete.mockReturnValue(chain(null))

      await expect(service.remove(VALID_ID)).rejects.toBeInstanceOf(NotFoundException)
    })
  })

  describe('reorder', () => {
    it('writes every new position in a single batch', async () => {
      model.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(2) })
      const second = '507f1f77bcf86cd799439012'

      await service.reorder([
        { id: VALID_ID, order: 1 },
        { id: second, order: 0 },
      ])

      const operations = model.bulkWrite.mock.calls[0][0] as {
        updateOne: { filter: { _id: Types.ObjectId }; update: { $set: { order: number } } }
      }[]

      expect(operations).toHaveLength(2)
      expect(operations[0].updateOne.update).toEqual({ $set: { order: 1 } })
      expect(String(operations[1].updateOne.filter._id)).toBe(second)
    })

    it('refuses the whole batch when an id does not exist', async () => {
      model.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) })

      await expect(service.reorder([{ id: VALID_ID, order: 0 }])).rejects.toBeInstanceOf(
        NotFoundException,
      )
      expect(model.bulkWrite).not.toHaveBeenCalled()
    })

    it('rejects a malformed id without writing anything', async () => {
      await expect(service.reorder([{ id: 'nope', order: 0 }])).rejects.toBeInstanceOf(
        BadRequestException,
      )
      expect(model.bulkWrite).not.toHaveBeenCalled()
    })

    it('is a no-op for an empty batch', async () => {
      await service.reorder([])

      expect(model.bulkWrite).not.toHaveBeenCalled()
      expect(model.find).toHaveBeenCalled()
    })
  })
})
