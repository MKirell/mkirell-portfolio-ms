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
import { DegreeService } from '@/portfolio/education/degree.service'
import { Degree } from '@/portfolio/education/degree.schema'
import { CreateDegreeDto, UpdateDegreeDto } from '@/portfolio/education/degree.dto'

@Roles(Role.Admin)
@Controller('admin/degrees')
export class DegreeController {
  constructor(private readonly service: DegreeService) {}

  @Get()
  findAll(): Promise<Degree[]> {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Degree> {
    return this.service.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateDegreeDto): Promise<Degree> {
    return this.service.create(dto)
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderDto): Promise<Degree[]> {
    return this.service.reorder(dto.entries)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDegreeDto): Promise<Degree> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id)
  }
}
