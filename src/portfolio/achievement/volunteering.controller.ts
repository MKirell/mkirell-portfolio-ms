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
import { VolunteeringService } from '@/portfolio/achievement/volunteering.service'
import { Volunteering } from '@/portfolio/achievement/volunteering.schema'
import {
  CreateVolunteeringDto,
  UpdateVolunteeringDto,
} from '@/portfolio/achievement/volunteering.dto'

@Roles(Role.Admin)
@Controller('admin/volunteering')
export class VolunteeringController {
  constructor(private readonly service: VolunteeringService) {}

  @Get()
  findAll(): Promise<Volunteering[]> {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Volunteering> {
    return this.service.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateVolunteeringDto): Promise<Volunteering> {
    return this.service.create(dto)
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderDto): Promise<Volunteering[]> {
    return this.service.reorder(dto.entries)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVolunteeringDto): Promise<Volunteering> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id)
  }
}
