import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificacionController } from './controllers/notificacion.controller';
import { NotificacionService } from './services/notificacion.service';

@Module({
    imports: [PrismaModule],
    controllers: [NotificacionController],
    providers: [NotificacionService],
    exports: [NotificacionService],
})
export class NotificacionModule { }
