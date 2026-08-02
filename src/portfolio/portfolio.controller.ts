import { Controller, Get, Param, Query } from '@nestjs/common'
import { Public } from '@/common/decorators/public.decorator'
import { PortfolioService } from '@/portfolio/portfolio.service'
import { LocaleService } from '@/portfolio/locale/locale.service'
import { LangParamDto, LangQueryDto } from '@/portfolio/portfolio.dto'
import type { LocaleSummary, ResolvedPortfolio } from '@/common/types/portfolio.types'

@Public()
@Controller('portfolio')
export class PortfolioController {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly localeService: LocaleService,
  ) {}

  @Get()
  async find(@Query() query: LangQueryDto): Promise<ResolvedPortfolio> {
    return this.portfolioService.resolve(query.lang)
  }

  @Get('languages')
  async languages(): Promise<LocaleSummary[]> {
    return this.localeService.findEnabled()
  }

  @Get(':lang')
  async findByLang(@Param() params: LangParamDto): Promise<ResolvedPortfolio> {
    return this.portfolioService.resolve(params.lang)
  }
}
