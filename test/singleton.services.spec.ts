import { NotFoundException } from '@nestjs/common'
import { Model } from 'mongoose'
import { PersonService } from '@/portfolio/person/person.service'
import { UiStringsService } from '@/portfolio/ui-strings/ui-strings.service'
import { LocaleService } from '@/portfolio/locale/locale.service'
import { Person } from '@/portfolio/person/person.schema'
import { UiStrings } from '@/portfolio/ui-strings/ui-strings.schema'
import { Locale } from '@/portfolio/locale/locale.schema'
import type { UpsertPersonDto } from '@/portfolio/person/person.dto'
import type { UpsertUiStringsDto } from '@/portfolio/ui-strings/ui-strings.dto'

function chain<T>(value: T) {
  return {
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  }
}

describe('PersonService', () => {
  let model: {
    findOne: jest.Mock
    findOneAndUpdate: jest.Mock
  }
  let service: PersonService

  beforeEach(() => {
    model = {
      findOne: jest.fn().mockReturnValue(chain({ name: 'Owner' })),
      findOneAndUpdate: jest.fn().mockReturnValue(chain({ name: 'Owner' })),
    }
    service = new PersonService(model as unknown as Model<Person>)
  })

  it('reads the single profile by its stable key', async () => {
    await service.find()

    expect(model.findOne).toHaveBeenCalledWith({ key: 'primary' })
  })

  it('explains that the profile has not been seeded when it is missing', async () => {
    model.findOne.mockReturnValue(chain(null))

    await expect(service.find()).rejects.toThrow(/has not been seeded/)
  })

  it('creates the profile on first upsert and pins the singleton key', async () => {
    await service.upsert({ name: 'Owner' } as UpsertPersonDto)

    const [filter, update, options] = model.findOneAndUpdate.mock.calls[0] as [
      unknown,
      { $set: Record<string, unknown> },
      Record<string, unknown>,
    ]

    expect(filter).toEqual({ key: 'primary' })
    expect(update.$set.key).toBe('primary')
    expect(options.upsert).toBe(true)
    expect(options.runValidators).toBe(true)
  })

  it('never creates a second profile on a partial update', async () => {
    await service.update({ brand: 'MKirell' })

    const options = model.findOneAndUpdate.mock.calls[0][2] as Record<string, unknown>
    expect(options.upsert).toBeUndefined()
  })

  it('reports a missing profile on partial update', async () => {
    model.findOneAndUpdate.mockReturnValue(chain(null))

    await expect(service.update({ brand: 'MKirell' })).rejects.toBeInstanceOf(NotFoundException)
  })
})

describe('UiStringsService', () => {
  let model: {
    find: jest.Mock
    findOne: jest.Mock
    findOneAndUpdate: jest.Mock
    findOneAndDelete: jest.Mock
  }
  let service: UiStringsService

  beforeEach(() => {
    model = {
      find: jest.fn().mockReturnValue(chain([{ lang: 'en' }, { lang: 'fr' }])),
      findOne: jest.fn().mockReturnValue(chain({ lang: 'en' })),
      findOneAndUpdate: jest.fn().mockReturnValue(chain({ lang: 'en' })),
      findOneAndDelete: jest.fn().mockReturnValue(chain({ lang: 'en' })),
    }
    service = new UiStringsService(model as unknown as Model<UiStrings>)
  })

  it('lists every stored language', async () => {
    await expect(service.findAll()).resolves.toHaveLength(2)
  })

  it('reads one language', async () => {
    await service.findByLang('en')

    expect(model.findOne).toHaveBeenCalledWith({ lang: 'en' })
  })

  it('names the missing language in the error', async () => {
    model.findOne.mockReturnValue(chain(null))

    await expect(service.findByLang('de')).rejects.toThrow(/"de"/)
  })

  it('pins the language on upsert so it cannot be spoofed by the body', async () => {
    await service.upsert('fr', { lang: 'en' } as unknown as UpsertUiStringsDto)

    const update = model.findOneAndUpdate.mock.calls[0][1] as { $set: Record<string, unknown> }
    expect(update.$set.lang).toBe('fr')
  })

  it('reports a missing language on partial update', async () => {
    model.findOneAndUpdate.mockReturnValue(chain(null))

    await expect(service.update('de', {})).rejects.toBeInstanceOf(NotFoundException)
  })

  it('deletes a language', async () => {
    await expect(service.remove('fr')).resolves.toBeUndefined()
  })

  it('reports a missing language on delete', async () => {
    model.findOneAndDelete.mockReturnValue(chain(null))

    await expect(service.remove('de')).rejects.toBeInstanceOf(NotFoundException)
  })
})

describe('LocaleService', () => {
  let model: {
    find: jest.Mock
    exists: jest.Mock
  }
  let service: LocaleService

  beforeEach(() => {
    model = {
      find: jest.fn().mockReturnValue(
        chain([
          { code: 'en', label: 'EN', flagCode: 'gb', order: 0 },
          { code: 'fr', label: 'FR', flagCode: 'fr', order: 1 },
        ]),
      ),
      exists: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'x' }) }),
    }
    service = new LocaleService(model as unknown as Model<Locale>)
  })

  it('returns only enabled languages, ordered, without internal fields', async () => {
    const result = await service.findEnabled()

    expect(model.find).toHaveBeenCalledWith({ enabled: true })
    expect(result).toEqual([
      { code: 'en', label: 'EN', flagCode: 'gb' },
      { code: 'fr', label: 'FR', flagCode: 'fr' },
    ])
  })

  it('confirms a supported language', async () => {
    await expect(service.isSupported('en')).resolves.toBe(true)
    expect(model.exists).toHaveBeenCalledWith({ code: 'en', enabled: true })
  })

  it('rejects a disabled or unknown language', async () => {
    model.exists.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) })

    await expect(service.isSupported('de')).resolves.toBe(false)
  })
})
