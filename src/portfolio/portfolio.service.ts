import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PersonService } from '@/portfolio/person/person.service'
import { LocaleService } from '@/portfolio/locale/locale.service'
import { UiStringsService } from '@/portfolio/ui-strings/ui-strings.service'
import { AboutStatService } from '@/portfolio/about/about-stat.service'
import { ExperienceService } from '@/portfolio/experience/experience.service'
import { ProjectService } from '@/portfolio/project/project.service'
import { SkillCategoryService } from '@/portfolio/skill/skill-category.service'
import { DegreeService } from '@/portfolio/education/degree.service'
import { CertificationService } from '@/portfolio/education/certification.service'
import { SpokenLanguageService } from '@/portfolio/education/spoken-language.service'
import { VolunteeringService } from '@/portfolio/achievement/volunteering.service'
import { AwardService } from '@/portfolio/achievement/award.service'
import type { LocaleSummary, ResolvedPortfolio } from '@/common/types/portfolio.types'

type TranslationSource = Record<string, unknown> & {
  translations?: unknown
}

@Injectable()
export class PortfolioService {
  constructor(
    private readonly config: ConfigService,
    private readonly localeService: LocaleService,
    private readonly personService: PersonService,
    private readonly uiStringsService: UiStringsService,
    private readonly aboutStatService: AboutStatService,
    private readonly experienceService: ExperienceService,
    private readonly projectService: ProjectService,
    private readonly skillCategoryService: SkillCategoryService,
    private readonly degreeService: DegreeService,
    private readonly certificationService: CertificationService,
    private readonly spokenLanguageService: SpokenLanguageService,
    private readonly volunteeringService: VolunteeringService,
    private readonly awardService: AwardService,
  ) {}

  async resolve(requestedLang?: string): Promise<ResolvedPortfolio> {
    const availableLangs = await this.localeService.findEnabled()
    if (availableLangs.length === 0) {
      throw new NotFoundException('No language has been configured yet')
    }

    const lang = this.pickLang(requestedLang, availableLangs)

    const [
      person,
      ui,
      stats,
      experiences,
      projects,
      skillCategories,
      degrees,
      certifications,
      spokenLanguages,
      volunteering,
      awards,
    ] = await Promise.all([
      this.personService.find(),
      this.uiStringsService.findByLang(lang),
      this.aboutStatService.findAll(),
      this.experienceService.findAll(),
      this.projectService.findAll(),
      this.skillCategoryService.findAll(),
      this.degreeService.findAll(),
      this.certificationService.findAll(),
      this.spokenLanguageService.findAll(),
      this.volunteeringService.findAll(),
      this.awardService.findAll(),
    ])

    const resolvedPerson = this.flatten(person as unknown as TranslationSource, lang)
    const resolvedUi = this.stripInternals(ui as unknown as TranslationSource)
    const aboutParagraphs = (resolvedUi.aboutParagraphs as string[] | undefined) ?? []
    delete resolvedUi.aboutParagraphs
    delete resolvedUi.id
    delete resolvedUi.lang

    return {
      lang,
      availableLangs,
      person: {
        ...resolvedPerson,
        resume: this.pickFromMap(person as unknown as TranslationSource, 'resumes', lang),
      },
      ui: resolvedUi,
      about: {
        paragraphs: aboutParagraphs,
        stats: this.flattenAll(stats as unknown as TranslationSource[], lang),
      },
      experiences: this.flattenAll(experiences as unknown as TranslationSource[], lang),
      projects: this.flattenAll(projects as unknown as TranslationSource[], lang),
      skillCategories: this.flattenAll(skillCategories as unknown as TranslationSource[], lang),
      education: {
        degrees: this.flattenAll(degrees as unknown as TranslationSource[], lang),
        certifications: this.flattenAll(certifications as unknown as TranslationSource[], lang),
        spokenLanguages: this.flattenAll(spokenLanguages as unknown as TranslationSource[], lang),
      },
      achievements: {
        volunteering: this.flattenAll(volunteering as unknown as TranslationSource[], lang),
        awards: this.flattenAll(awards as unknown as TranslationSource[], lang),
      },
    }
  }

  private pickLang(requested: string | undefined, available: LocaleSummary[]): string {
    const codes = available.map((locale) => locale.code)
    if (requested && codes.includes(requested)) return requested
    if (requested) throw new NotFoundException(`Language "${requested}" is not available`)

    const fallback = this.config.get<string>('app.defaultLang')
    return fallback && codes.includes(fallback) ? fallback : codes[0]
  }

  private flattenAll(items: TranslationSource[], lang: string): Record<string, unknown>[] {
    return items.map((item) => this.flatten(item, lang))
  }

  private flatten(item: TranslationSource, lang: string): Record<string, unknown> {
    const base = this.stripInternals(item)
    delete base.translations
    const translation = this.readTranslation(item.translations, lang)
    return { ...base, ...translation }
  }

  private readTranslation(source: unknown, lang: string): Record<string, unknown> {
    if (source instanceof Map) {
      return (source.get(lang) as Record<string, unknown> | undefined) ?? {}
    }
    if (source && typeof source === 'object') {
      const record = source as Record<string, unknown>
      return (record[lang] as Record<string, unknown> | undefined) ?? {}
    }
    return {}
  }

  private pickFromMap(item: TranslationSource, field: string, lang: string): string | null {
    const source = item[field]
    if (source instanceof Map) return (source.get(lang) as string | undefined) ?? null
    if (source && typeof source === 'object') {
      return (source as Record<string, string>)[lang] ?? null
    }
    return null
  }

  private stripInternals(item: TranslationSource): Record<string, unknown> {
    const clone: Record<string, unknown> = { ...item }
    const id = clone._id
    if (id !== undefined && id !== null) {
      clone.id = typeof id === 'string' ? id : (id as { toString(): string }).toString()
      delete clone._id
    }
    delete clone.__v
    delete clone.createdAt
    delete clone.updatedAt
    delete clone.key
    return clone
  }
}
