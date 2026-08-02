import { NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { PortfolioService } from '@/portfolio/portfolio.service'
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

const person = {
  _id: 'person-id',
  key: 'primary',
  name: 'Mohamed Khalil ZRELLY',
  brand: 'MKirell',
  resumes: { en: 'resume_en.pdf', fr: 'resume_fr.pdf' },
  createdAt: new Date(),
  updatedAt: new Date(),
  translations: {
    en: { jobTitle: 'Generative AI Engineer Apprentice', description: 'English bio' },
    fr: { jobTitle: 'Apprenti Ingénieur IA Générative', description: 'Bio française' },
  },
}

const uiStrings = {
  _id: 'ui-id',
  lang: 'en',
  nav: { about: 'About' },
  headings: { about: 'About me' },
  labels: { showMore: 'Show more' },
  hero: { title: 'Hello' },
  shell: { promptUser: 'guest' },
  aboutParagraphs: ['First paragraph', 'Second paragraph'],
  contactDesc: 'Get in touch',
  footerCopy: '© MKirell',
}

const experiences = [
  {
    _id: 'exp-1',
    order: 0,
    current: true,
    company: 'Crédit Agricole',
    tags: ['LangGraph'],
    doc: null,
    link: 'https://linkedin.com/company/ca',
    translations: {
      en: { period: '09/2025 — Present', role: 'GenAI Engineer', bullets: ['Built things'] },
      fr: { period: '09/2025 — Aujourd’hui', role: 'Ingénieur IA', bullets: ['Développé'] },
    },
  },
]

const awards = [
  {
    _id: 'award-1',
    order: 0,
    icon: 'Trophy',
    flagCode: 'nl',
    images: ['a.jpg'],
    doc: null,
    translations: {
      en: { title: 'Vice Champions', place: 'Netherlands', date: 'Oct 2023' },
      fr: { title: 'Vice-Champions', place: 'Pays-Bas', date: 'Oct. 2023' },
    },
  },
]

function listStub(items: unknown[]) {
  return { findAll: jest.fn().mockResolvedValue(items) }
}

describe('PortfolioService', () => {
  let service: PortfolioService
  let uiStringsService: { findByLang: jest.Mock; findAll: jest.Mock }
  let localeService: { findEnabled: jest.Mock }

  beforeEach(async () => {
    uiStringsService = {
      findByLang: jest.fn().mockImplementation((lang: string) => ({ ...uiStrings, lang })),
      findAll: jest.fn(),
    }
    localeService = {
      findEnabled: jest.fn().mockResolvedValue([
        { code: 'en', label: 'EN', flagCode: 'gb' },
        { code: 'fr', label: 'FR', flagCode: 'fr' },
      ]),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        PortfolioService,
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('en') } },
        { provide: LocaleService, useValue: localeService },
        { provide: PersonService, useValue: { find: jest.fn().mockResolvedValue(person) } },
        { provide: UiStringsService, useValue: uiStringsService },
        { provide: AboutStatService, useValue: listStub([]) },
        { provide: ExperienceService, useValue: listStub(experiences) },
        { provide: ProjectService, useValue: listStub([]) },
        { provide: SkillCategoryService, useValue: listStub([]) },
        { provide: DegreeService, useValue: listStub([]) },
        { provide: CertificationService, useValue: listStub([]) },
        { provide: SpokenLanguageService, useValue: listStub([]) },
        { provide: VolunteeringService, useValue: listStub([]) },
        { provide: AwardService, useValue: listStub(awards) },
      ],
    }).compile()

    service = moduleRef.get(PortfolioService)
  })

  it('flattens the requested translation onto each entity', async () => {
    const result = await service.resolve('fr')

    expect(result.lang).toBe('fr')
    expect(result.experiences[0]).toMatchObject({
      company: 'Crédit Agricole',
      role: 'Ingénieur IA',
      period: '09/2025 — Aujourd’hui',
      current: true,
    })
    expect(result.achievements.awards[0]).toMatchObject({
      icon: 'Trophy',
      title: 'Vice-Champions',
      place: 'Pays-Bas',
    })
  })

  it('never leaks the raw translation map to consumers', async () => {
    const result = await service.resolve('en')

    expect(result.experiences[0]).not.toHaveProperty('translations')
    expect(result.person).not.toHaveProperty('translations')
    expect(result.achievements.awards[0]).not.toHaveProperty('translations')
  })

  it('strips mongo bookkeeping and exposes a plain id', async () => {
    const result = await service.resolve('en')

    expect(result.experiences[0].id).toBe('exp-1')
    expect(result.experiences[0]).not.toHaveProperty('_id')
    expect(result.person).not.toHaveProperty('createdAt')
    expect(result.person).not.toHaveProperty('updatedAt')
    expect(result.person).not.toHaveProperty('key')
  })

  it('resolves the resume for the requested language', async () => {
    await expect(service.resolve('fr')).resolves.toMatchObject({
      person: { resume: 'resume_fr.pdf' },
    })
    await expect(service.resolve('en')).resolves.toMatchObject({
      person: { resume: 'resume_en.pdf' },
    })
  })

  it('moves about paragraphs out of the ui bag into the about section', async () => {
    const result = await service.resolve('en')

    expect(result.about.paragraphs).toEqual(['First paragraph', 'Second paragraph'])
    expect(result.ui).not.toHaveProperty('aboutParagraphs')
  })

  it('falls back to the configured default language when none is requested', async () => {
    const result = await service.resolve()

    expect(result.lang).toBe('en')
    expect(uiStringsService.findByLang).toHaveBeenCalledWith('en')
  })

  it('rejects a language that is not enabled', async () => {
    await expect(service.resolve('de')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('reports every enabled language alongside the payload', async () => {
    const result = await service.resolve('en')

    expect(result.availableLangs).toEqual([
      { code: 'en', label: 'EN', flagCode: 'gb' },
      { code: 'fr', label: 'FR', flagCode: 'fr' },
    ])
  })

  it('fails clearly when no language has been configured', async () => {
    localeService.findEnabled.mockResolvedValue([])

    await expect(service.resolve()).rejects.toBeInstanceOf(NotFoundException)
  })
})
