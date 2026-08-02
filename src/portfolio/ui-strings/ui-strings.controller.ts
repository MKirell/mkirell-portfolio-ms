import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
} from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { Role } from '@/auth/roles'
import { UiStringsService } from '@/portfolio/ui-strings/ui-strings.service'
import { UiStrings } from '@/portfolio/ui-strings/ui-strings.schema'
import { UpdateUiStringsDto, UpsertUiStringsDto } from '@/portfolio/ui-strings/ui-strings.dto'
import { LangParamDto } from '@/portfolio/portfolio.dto'

@Roles(Role.Admin)
@Controller('admin/ui-strings')
export class UiStringsController {
  constructor(private readonly service: UiStringsService) {}

  @Get()
  findAll(): Promise<UiStrings[]> {
    return this.service.findAll()
  }

  @Get(':lang')
  findByLang(@Param() params: LangParamDto): Promise<UiStrings> {
    return this.service.findByLang(params.lang)
  }

  @Put(':lang')
  upsert(@Param() params: LangParamDto, @Body() dto: UpsertUiStringsDto): Promise<UiStrings> {
    return this.service.upsert(params.lang, dto)
  }

  @Patch(':lang')
  update(@Param() params: LangParamDto, @Body() dto: UpdateUiStringsDto): Promise<UiStrings> {
    return this.service.update(params.lang, dto)
  }

  @Delete(':lang')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param() params: LangParamDto): Promise<void> {
    return this.service.remove(params.lang)
  }
}
