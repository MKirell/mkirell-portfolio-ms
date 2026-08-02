import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { PortfolioController } from '@/portfolio/portfolio.controller'
import { PortfolioService } from '@/portfolio/portfolio.service'

import { Person, PersonSchema } from '@/portfolio/person/person.schema'
import { PersonService } from '@/portfolio/person/person.service'
import { PersonController } from '@/portfolio/person/person.controller'

import { Locale, LocaleSchema } from '@/portfolio/locale/locale.schema'
import { LocaleService } from '@/portfolio/locale/locale.service'
import { LocaleController } from '@/portfolio/locale/locale.controller'

import { UiStrings, UiStringsSchema } from '@/portfolio/ui-strings/ui-strings.schema'
import { UiStringsService } from '@/portfolio/ui-strings/ui-strings.service'
import { UiStringsController } from '@/portfolio/ui-strings/ui-strings.controller'

import { AboutStat, AboutStatSchema } from '@/portfolio/about/about-stat.schema'
import { AboutStatService } from '@/portfolio/about/about-stat.service'
import { AboutStatController } from '@/portfolio/about/about-stat.controller'

import { Experience, ExperienceSchema } from '@/portfolio/experience/experience.schema'
import { ExperienceService } from '@/portfolio/experience/experience.service'
import { ExperienceController } from '@/portfolio/experience/experience.controller'

import { Project, ProjectSchema } from '@/portfolio/project/project.schema'
import { ProjectService } from '@/portfolio/project/project.service'
import { ProjectController } from '@/portfolio/project/project.controller'

import { SkillCategory, SkillCategorySchema } from '@/portfolio/skill/skill-category.schema'
import { SkillCategoryService } from '@/portfolio/skill/skill-category.service'
import { SkillCategoryController } from '@/portfolio/skill/skill-category.controller'

import { Degree, DegreeSchema } from '@/portfolio/education/degree.schema'
import { DegreeService } from '@/portfolio/education/degree.service'
import { DegreeController } from '@/portfolio/education/degree.controller'

import { Certification, CertificationSchema } from '@/portfolio/education/certification.schema'
import { CertificationService } from '@/portfolio/education/certification.service'
import { CertificationController } from '@/portfolio/education/certification.controller'

import { SpokenLanguage, SpokenLanguageSchema } from '@/portfolio/education/spoken-language.schema'
import { SpokenLanguageService } from '@/portfolio/education/spoken-language.service'
import { SpokenLanguageController } from '@/portfolio/education/spoken-language.controller'

import { Volunteering, VolunteeringSchema } from '@/portfolio/achievement/volunteering.schema'
import { VolunteeringService } from '@/portfolio/achievement/volunteering.service'
import { VolunteeringController } from '@/portfolio/achievement/volunteering.controller'

import { Award, AwardSchema } from '@/portfolio/achievement/award.schema'
import { AwardService } from '@/portfolio/achievement/award.service'
import { AwardController } from '@/portfolio/achievement/award.controller'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Person.name, schema: PersonSchema },
      { name: Locale.name, schema: LocaleSchema },
      { name: UiStrings.name, schema: UiStringsSchema },
      { name: AboutStat.name, schema: AboutStatSchema },
      { name: Experience.name, schema: ExperienceSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: SkillCategory.name, schema: SkillCategorySchema },
      { name: Degree.name, schema: DegreeSchema },
      { name: Certification.name, schema: CertificationSchema },
      { name: SpokenLanguage.name, schema: SpokenLanguageSchema },
      { name: Volunteering.name, schema: VolunteeringSchema },
      { name: Award.name, schema: AwardSchema },
    ]),
  ],
  controllers: [
    PortfolioController,
    PersonController,
    LocaleController,
    UiStringsController,
    AboutStatController,
    ExperienceController,
    ProjectController,
    SkillCategoryController,
    DegreeController,
    CertificationController,
    SpokenLanguageController,
    VolunteeringController,
    AwardController,
  ],
  providers: [
    PortfolioService,
    PersonService,
    LocaleService,
    UiStringsService,
    AboutStatService,
    ExperienceService,
    ProjectService,
    SkillCategoryService,
    DegreeService,
    CertificationService,
    SpokenLanguageService,
    VolunteeringService,
    AwardService,
  ],
})
export class PortfolioModule {}
