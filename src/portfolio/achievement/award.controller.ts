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
import { AwardService } from '@/portfolio/achievement/award.service'
import { Award } from '@/portfolio/achievement/award.schema'
import { CreateAwardDto, UpdateAwardDto } from '@/portfolio/achievement/award.dto'

@Roles(Role.Admin)
@Controller('admin/awards')
export class AwardController {
  constructor(private readonly service: AwardService) {}

  @Get()
  findAll(): Promise<Award[]> {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Award> {
    return this.service.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateAwardDto): Promise<Award> {
    return this.service.create(dto)
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderDto): Promise<Award[]> {
    return this.service.reorder(dto.entries)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAwardDto): Promise<Award> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id)
  }
}
