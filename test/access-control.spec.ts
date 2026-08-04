import { INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { getConnectionToken } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { JWT_KEY_PROVIDER } from '@/auth/jwks.token'
import { CognitoStrategy, COGNITO_STRATEGY } from '@/auth/strategies/cognito.strategy'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter'
import { HealthController } from '@/health/health.controller'
import { PortfolioController } from '@/portfolio/portfolio.controller'
import { PortfolioService } from '@/portfolio/portfolio.service'
import { LocaleService } from '@/portfolio/locale/locale.service'
import { ExperienceController } from '@/portfolio/experience/experience.controller'
import { ExperienceService } from '@/portfolio/experience/experience.service'
import {
  accessToken,
  adminToken,
  ADMIN_SCOPE,
  cognitoConfig,
  foreignKeys,
  guestToken,
  staticKeyProvider,
} from './support/cognito-token'

const validExperience = {
  company: 'Crédit Agricole',
  tags: ['LangGraph'],
  translations: {
    en: { period: '09/2025 — Present', role: 'GenAI Engineer', bullets: ['Built things'] },
  },
}

describe('read/write access control', () => {
  let app: INestApplication
  let experienceService: {
    findAll: jest.Mock
    findOne: jest.Mock
    create: jest.Mock
    update: jest.Mock
    remove: jest.Mock
    reorder: jest.Mock
  }

  beforeAll(async () => {
    experienceService = {
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockImplementation((dto: unknown) => Promise.resolve(dto)),
      update: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue(undefined),
      reorder: jest.fn().mockResolvedValue([]),
    }

    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule.register({ session: false, defaultStrategy: COGNITO_STRATEGY })],
      controllers: [HealthController, PortfolioController, ExperienceController],
      providers: [
        { provide: JWT_KEY_PROVIDER, useValue: staticKeyProvider },
        CognitoStrategy,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(false),
            getOrThrow: jest.fn(() => cognitoConfig),
          },
        },
        {
          provide: PortfolioService,
          useValue: { resolve: jest.fn().mockResolvedValue({ lang: 'en', experiences: [] }) },
        },
        {
          provide: LocaleService,
          useValue: { findEnabled: jest.fn().mockResolvedValue([{ code: 'en' }]) },
        },
        { provide: ExperienceService, useValue: experienceService },
        { provide: getConnectionToken(), useValue: { readyState: 1 } },
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transform: true,
      }),
    )
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('the portfolio viewer, unauthenticated', () => {
    it('reads the portfolio', async () => {
      await request(app.getHttpServer()).get('/portfolio').expect(200)
    })

    it('reads a single language', async () => {
      await request(app.getHttpServer()).get('/portfolio/fr').expect(200)
    })

    it('lists the available languages', async () => {
      await request(app.getHttpServer()).get('/portfolio/languages').expect(200)
    })

    it('reaches the health probe', async () => {
      await request(app.getHttpServer()).get('/health').expect(200)
    })
  })

  describe('write endpoints without a token', () => {
    it.each([
      ['post', '/admin/experiences'],
      ['patch', '/admin/experiences/507f1f77bcf86cd799439011'],
      ['delete', '/admin/experiences/507f1f77bcf86cd799439011'],
      ['patch', '/admin/experiences/reorder'],
    ])('rejects %s %s with 401', async (method, path) => {
      const server = request(app.getHttpServer())
      await server[method as 'post'](path).send({}).expect(401)
    })

    it('rejects reading the admin list with 401', async () => {
      await request(app.getHttpServer()).get('/admin/experiences').expect(401)
      expect(experienceService.findAll).not.toHaveBeenCalled()
    })

    it('rejects a malformed bearer token', async () => {
      await request(app.getHttpServer())
        .get('/admin/experiences')
        .set('Authorization', 'Bearer not-a-jwt')
        .expect(401)
    })
  })

  describe('tokens the user pool did not mint', () => {
    it('rejects one signed with a key outside the pool JWKS', async () => {
      const swapped = accessToken({ scope: ADMIN_SCOPE }, { privateKey: foreignKeys.privateKey })

      await request(app.getHttpServer())
        .get('/admin/experiences')
        .set('Authorization', `Bearer ${swapped}`)
        .expect(401)
    })

    it('rejects one issued by a different user pool', async () => {
      const otherPool = accessToken(
        { scope: ADMIN_SCOPE },
        { issuer: 'https://cognito-idp.eu-west-3.amazonaws.com/eu-west-3_Someone1' },
      )

      await request(app.getHttpServer())
        .get('/admin/experiences')
        .set('Authorization', `Bearer ${otherPool}`)
        .expect(401)
    })

    it('rejects one minted for an app client this service does not serve', async () => {
      const foreignClient = accessToken({ scope: ADMIN_SCOPE, client_id: 'someone-elses-app' })

      await request(app.getHttpServer())
        .get('/admin/experiences')
        .set('Authorization', `Bearer ${foreignClient}`)
        .expect(401)
    })

    it('rejects an expired token', async () => {
      const expired = accessToken({ scope: ADMIN_SCOPE }, { expiresIn: '-1s' })

      await request(app.getHttpServer())
        .get('/admin/experiences')
        .set('Authorization', `Bearer ${expired}`)
        .expect(401)
    })

    it('rejects an id token presented as an access token', async () => {
      const idToken = accessToken({ token_use: 'id', scope: ADMIN_SCOPE })

      await request(app.getHttpServer())
        .get('/admin/experiences')
        .set('Authorization', `Bearer ${idToken}`)
        .expect(401)
    })
  })

  describe('an authenticated caller without the admin scope', () => {
    it('is forbidden from writing', async () => {
      await request(app.getHttpServer())
        .post('/admin/experiences')
        .set('Authorization', `Bearer ${guestToken()}`)
        .send(validExperience)
        .expect(403)

      expect(experienceService.create).not.toHaveBeenCalled()
    })

    it('is forbidden from reading admin data', async () => {
      await request(app.getHttpServer())
        .get('/admin/experiences')
        .set('Authorization', `Bearer ${guestToken()}`)
        .expect(403)
    })

    it('is forbidden when the admin scope belongs to another resource server', async () => {
      const crossService = guestToken({ scope: 'some-other-ms/admin' })

      await request(app.getHttpServer())
        .get('/admin/experiences')
        .set('Authorization', `Bearer ${crossService}`)
        .expect(403)
    })
  })

  describe('the console admin', () => {
    it('creates an entry', async () => {
      await request(app.getHttpServer())
        .post('/admin/experiences')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send(validExperience)
        .expect(201)

      expect(experienceService.create).toHaveBeenCalled()
    })

    it('deletes an entry', async () => {
      await request(app.getHttpServer())
        .delete('/admin/experiences/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken()}`)
        .expect(204)
    })

    it('reorders entries', async () => {
      await request(app.getHttpServer())
        .patch('/admin/experiences/reorder')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ entries: [{ id: '507f1f77bcf86cd799439011', order: 0 }] })
        .expect(200)

      expect(experienceService.reorder).toHaveBeenCalled()
    })

    it('is authorised through a Cognito group as well as a scope', async () => {
      const viaGroup = accessToken({ 'cognito:groups': ['admin'] })

      await request(app.getHttpServer())
        .get('/admin/experiences')
        .set('Authorization', `Bearer ${viaGroup}`)
        .expect(200)
    })

    it('is still rejected when the payload fails validation', async () => {
      await request(app.getHttpServer())
        .post('/admin/experiences')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ company: 'Acme' })
        .expect(400)
    })

    it('rejects unknown properties instead of silently storing them', async () => {
      await request(app.getHttpServer())
        .post('/admin/experiences')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ ...validExperience, isSuperAdmin: true })
        .expect(400)
    })

    it('rejects a translation whose language code is not a language code', async () => {
      await request(app.getHttpServer())
        .post('/admin/experiences')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          ...validExperience,
          translations: { 'not-a-lang': validExperience.translations.en },
        })
        .expect(400)
    })
  })
})
