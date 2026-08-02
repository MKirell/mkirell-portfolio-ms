import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from '@/auth/auth.controller'
import { jwksKeyProvider } from '@/auth/jwks.provider'
import { CognitoStrategy, COGNITO_STRATEGY } from '@/auth/strategies/cognito.strategy'

@Module({
  imports: [PassportModule.register({ session: false, defaultStrategy: COGNITO_STRATEGY })],
  controllers: [AuthController],
  providers: [jwksKeyProvider, CognitoStrategy],
})
export class AuthModule {}
