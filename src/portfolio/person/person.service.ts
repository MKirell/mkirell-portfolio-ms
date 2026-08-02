import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Person } from '@/portfolio/person/person.schema'
import { toPlain } from '@/common/utils/serialize'
import type { UpdatePersonDto, UpsertPersonDto } from '@/portfolio/person/person.dto'

const SINGLETON_KEY = 'primary'

@Injectable()
export class PersonService {
  constructor(@InjectModel(Person.name) private readonly model: Model<Person>) {}

  async find(): Promise<Person> {
    const person = await this.model.findOne({ key: SINGLETON_KEY }).lean<Person>().exec()
    if (!person) throw new NotFoundException('Person profile has not been seeded yet')
    return toPlain(person)
  }

  async upsert(payload: UpsertPersonDto): Promise<Person> {
    const person = await this.model
      .findOneAndUpdate(
        { key: SINGLETON_KEY },
        { $set: { ...payload, key: SINGLETON_KEY } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      )
      .lean<Person>()
      .exec()
    return toPlain(person)
  }

  async update(payload: UpdatePersonDto): Promise<Person> {
    const person = await this.model
      .findOneAndUpdate(
        { key: SINGLETON_KEY },
        { $set: payload },
        { new: true, runValidators: true },
      )
      .lean<Person>()
      .exec()
    if (!person) throw new NotFoundException('Person profile has not been seeded yet')
    return toPlain(person)
  }
}
