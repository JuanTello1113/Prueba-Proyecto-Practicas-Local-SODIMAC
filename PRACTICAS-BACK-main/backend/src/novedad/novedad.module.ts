import { Module } from '@nestjs/common';
import { NovedadeService } from './services/novedad.service';
import { NovedadController } from './controllers/novedad.controller';
import { PrismaService } from 'prisma/prisma.service';
import { NotificacionModule } from '../notificacion/notificacion.module';
import { CorreoLogModule } from '../correo_log/correo_log.module';

@Module({
  imports: [NotificacionModule, CorreoLogModule],
  controllers: [NovedadController],
  providers: [NovedadeService, PrismaService],
  exports: [NovedadeService],
})
export class NovedadModule { }
