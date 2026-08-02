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
import { ProjectService } from '@/portfolio/project/project.service'
import { Project } from '@/portfolio/project/project.schema'
import { CreateProjectDto, UpdateProjectDto } from '@/portfolio/project/project.dto'

@Roles(Role.Admin)
@Controller('admin/projects')
export class ProjectController {
  constructor(private readonly service: ProjectService) {}

  @Get()
  findAll(): Promise<Project[]> {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Project> {
    return this.service.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateProjectDto): Promise<Project> {
    return this.service.create(dto)
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderDto): Promise<Project[]> {
    return this.service.reorder(dto.entries)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto): Promise<Project> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id)
  }
}
