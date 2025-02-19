import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { ProxyController } from './proxy/proxy.controller'

@Module({
  imports: [HttpModule],
  controllers: [ProxyController],
  providers: [AppService],
})
export class AppModule {}
