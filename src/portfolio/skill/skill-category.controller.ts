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
import { SkillCategoryService } from '@/portfolio/skill/skill-category.service'
import { SkillCategory } from '@/portfolio/skill/skill-category.schema'
import {
  CreateSkillCategoryDto,
  UpdateSkillCategoryDto,
} from '@/portfolio/skill/skill-category.dto'

@Roles(Role.Admin)
@Controller('admin/skill-categories')
export class SkillCategoryController {
  constructor(private readonly service: SkillCategoryService) {}

  @Get()
  findAll(): Promise<SkillCategory[]> {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SkillCategory> {
    return this.service.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateSkillCategoryDto): Promise<SkillCategory> {
    return this.service.create(dto)
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderDto): Promise<SkillCategory[]> {
    return this.service.reorder(dto.entries)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSkillCategoryDto): Promise<SkillCategory> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id)
  }
}
