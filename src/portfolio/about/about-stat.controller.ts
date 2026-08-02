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
import { AboutStatService } from '@/portfolio/about/about-stat.service'
import { AboutStat } from '@/portfolio/about/about-stat.schema'
import { CreateAboutStatDto, UpdateAboutStatDto } from '@/portfolio/about/about-stat.dto'

@Roles(Role.Admin)
@Controller('admin/about-stats')
export class AboutStatController {
  constructor(private readonly service: AboutStatService) {}

  @Get()
  findAll(): Promise<AboutStat[]> {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AboutStat> {
    return this.service.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateAboutStatDto): Promise<AboutStat> {
    return this.service.create(dto)
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderDto): Promise<AboutStat[]> {
    return this.service.reorder(dto.entries)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAboutStatDto): Promise<AboutStat> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id)
  }
}
