import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CorreoLogService {
    private readonly logger = new Logger(CorreoLogService.name);

    constructor(private prisma: PrismaService) { }

    async enviarCorreo(destinatario: string, asunto: string, mensaje: string, idNotificacion?: number) {
        // 1. Simular envío (aquí iría la lógica real con Nodemailer/SendGrid)
        this.logger.log(`📧 [SIMULACIÓN] Enviando correo a: ${destinatario}`);
        this.logger.log(`📝 Asunto: ${asunto}`);
        this.logger.log(`📄 Mensaje: ${mensaje}`);

        // 2. Registrar en Log
        await this.crearLog({
            id_notificacion: idNotificacion,
            estado_envio: 'ENVIADO_SIMULADO', // O 'FALLIDO' si falla
            mensaje_error: null,
        });

        return { success: true, message: 'Correo simulado enviado' };
    }

    async crearLog(data: {
        id_notificacion?: number;
        estado_envio: string;
        mensaje_error?: string | null;
    }) {
        return this.prisma.correo_log.create({
            data: {
                id_notificacion: data.id_notificacion,
                estado_envio: data.estado_envio,
                mensaje_error: data.mensaje_error,
            },
        });
    }
}
