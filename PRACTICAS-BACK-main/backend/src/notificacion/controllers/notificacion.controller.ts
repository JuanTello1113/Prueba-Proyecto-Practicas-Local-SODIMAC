import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { NotificacionService } from '../services/notificacion.service';

@Controller('notificacion')
export class NotificacionController {
    constructor(private readonly notificacionService: NotificacionService) { }

    @Post()
    crear(@Body() body: { id_usuario: number; id_novedad?: number; mensaje: string }) {
        return this.notificacionService.crearNotificacion(body);
    }

    @Get('usuario/:id')
    obtenerPorUsuario(@Param('id') id: string) {
        return this.notificacionService.obtenerPorUsuario(Number(id));
    }

    @Patch(':id/leida')
    marcarComoLeida(@Param('id') id: string) {
        return this.notificacionService.marcarComoLeida(Number(id));
    }
}
