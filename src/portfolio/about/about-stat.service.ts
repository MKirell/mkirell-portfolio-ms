import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { BaseCrudService } from '@/common/services/base-crud.service'
import { AboutStat } from '@/portfolio/about/about-stat.schema'

@Injectable()
export class AboutStatService extends BaseCrudService<AboutStat> {
  constructor(@InjectModel(AboutStat.name) model: Model<AboutStat>) {
    super(model, 'About stat')
  }
}
