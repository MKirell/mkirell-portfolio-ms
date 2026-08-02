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
import { CertificationService } from '@/portfolio/education/certification.service'
import { Certification } from '@/portfolio/education/certification.schema'
import {
  CreateCertificationDto,
  UpdateCertificationDto,
} from '@/portfolio/education/certification.dto'

@Roles(Role.Admin)
@Controller('admin/certifications')
export class CertificationController {
  constructor(private readonly service: CertificationService) {}

  @Get()
  findAll(): Promise<Certification[]> {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Certification> {
    return this.service.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateCertificationDto): Promise<Certification> {
    return this.service.create(dto)
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderDto): Promise<Certification[]> {
    return this.service.reorder(dto.entries)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCertificationDto): Promise<Certification> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id)
  }
}
