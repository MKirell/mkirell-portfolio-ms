import { Body, Controller, Get, Patch, Put } from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { Role } from '@/auth/roles'
import { PersonService } from '@/portfolio/person/person.service'
import { Person } from '@/portfolio/person/person.schema'
import { UpdatePersonDto, UpsertPersonDto } from '@/portfolio/person/person.dto'

@Roles(Role.Admin)
@Controller('admin/person')
export class PersonController {
  constructor(private readonly service: PersonService) {}

  @Get()
  find(): Promise<Person> {
    return this.service.find()
  }

  @Put()
  upsert(@Body() dto: UpsertPersonDto): Promise<Person> {
    return this.service.upsert(dto)
  }

  @Patch()
  update(@Body() dto: UpdatePersonDto): Promise<Person> {
    return this.service.update(dto)
  }
}
