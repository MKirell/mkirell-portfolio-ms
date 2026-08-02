import { Controller, Get } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection, ConnectionStates } from 'mongoose'
import { Public } from '@/common/decorators/public.decorator'

@Public()
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check(): { status: string; database: string; uptime: number } {
    return {
      status: 'ok',
      database: this.connection.readyState === ConnectionStates.connected ? 'up' : 'down',
      uptime: Math.floor(process.uptime()),
    }
  }
}
