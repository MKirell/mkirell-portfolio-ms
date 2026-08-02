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
import { SpokenLanguageService } from '@/portfolio/education/spoken-language.service'
import { SpokenLanguage } from '@/portfolio/education/spoken-language.schema'
import {
  CreateSpokenLanguageDto,
  UpdateSpokenLanguageDto,
} from '@/portfolio/education/spoken-language.dto'

@Roles(Role.Admin)
@Controller('admin/spoken-languages')
export class SpokenLanguageController {
  constructor(private readonly service: SpokenLanguageService) {}

  @Get()
  findAll(): Promise<SpokenLanguage[]> {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SpokenLanguage> {
    return this.service.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateSpokenLanguageDto): Promise<SpokenLanguage> {
    return this.service.create(dto)
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderDto): Promise<SpokenLanguage[]> {
    return this.service.reorder(dto.entries)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSpokenLanguageDto): Promise<SpokenLanguage> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id)
  }
}
