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
import { ExperienceService } from '@/portfolio/experience/experience.service'
import { Experience } from '@/portfolio/experience/experience.schema'
import { CreateExperienceDto, UpdateExperienceDto } from '@/portfolio/experience/experience.dto'

@Roles(Role.Admin)
@Controller('admin/experiences')
export class ExperienceController {
  constructor(private readonly service: ExperienceService) {}

  @Get()
  findAll(): Promise<Experience[]> {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Experience> {
    return this.service.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateExperienceDto): Promise<Experience> {
    return this.service.create(dto)
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderDto): Promise<Experience[]> {
    return this.service.reorder(dto.entries)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExperienceDto): Promise<Experience> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id)
  }
}
