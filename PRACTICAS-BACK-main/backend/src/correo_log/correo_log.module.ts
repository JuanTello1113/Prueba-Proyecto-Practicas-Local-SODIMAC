import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { CorreoLogService } from './services/correo_log.service';

@Module({
    imports: [PrismaModule],
    providers: [CorreoLogService],
    exports: [CorreoLogService],
})
export class CorreoLogModule { }
