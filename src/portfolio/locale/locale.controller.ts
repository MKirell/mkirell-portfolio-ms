import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { Role } from '@/auth/roles'
import { ReorderDto } from '@/common/dto/reorder.dto'
import { LocaleService } from '@/portfolio/locale/locale.service'
import { Locale } from '@/portfolio/locale/locale.schema'
import { CreateLocaleDto, UpdateLocaleDto } from '@/portfolio/locale/locale.dto'

@Roles(Role.Admin)
@Controller('admin/locales')
export class LocaleController {
  constructor(private readonly service: LocaleService) {}

  @Get()
  findAll(): Promise<Locale[]> {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Locale> {
    return this.service.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateLocaleDto): Promise<Locale> {
    return this.service.create(dto)
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderDto): Promise<Locale[]> {
    return this.service.reorder(dto.entries)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLocaleDto): Promise<Locale> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id)
  }
}
