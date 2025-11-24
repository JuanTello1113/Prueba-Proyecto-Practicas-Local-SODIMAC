import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class NotificacionService {
    constructor(private prisma: PrismaService) { }

    async crearNotificacion(data: {
        id_usuario: number;
        id_novedad?: number;
        mensaje: string;
    }) {
        return this.prisma.notificacion.create({
            data: {
                id_usuario: data.id_usuario,
                id_novedad: data.id_novedad,
                mensaje: data.mensaje,
                leido: false,
            },
        });
    }

    async obtenerPorUsuario(idUsuario: number) {
        return this.prisma.notificacion.findMany({
            where: { id_usuario: idUsuario },
            orderBy: { fecha_creacion: 'desc' },
            take: 20, // Limitar a las últimas 20
        });
    }

    async marcarComoLeida(idNotificacion: number) {
        return this.prisma.notificacion.update({
            where: { id_notificacion: idNotificacion },
            data: { leido: true },
        });
    }
}
