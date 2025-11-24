import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { getMensajePorEstadoBackendPorId } from 'src/utils/getMensajePorEstado';
import { NotificacionService } from '../../notificacion/services/notificacion.service';
import { CorreoLogService } from '../../correo_log/services/correo_log.service';

interface FiltrosTienda {
  tipo?: string;
  fecha?: {
    gte?: Date;
    lte?: Date;
  };
  cedula?: number;
}

interface FiltrosParaNomina {
  tienda?: string;
  tipo?: string;
  fecha?: {
    gte?: Date;
    lte?: Date;
  };
  cedula?: number;
}

interface CrearNovedadIndividual {
  titulo: string;
  cedula: number;
  nombre: string;
  detalle: string;
  tienda?: string;
  jefe?: string;
  fecha?: string;
}

interface AuthenticatedRequest extends Request {
  user: {
    nombre: string;
    correo: string;
    id_usuario: number;
    esJefe: boolean;
    esNomina: boolean;
    nombreTienda: string;
  };
}

interface DetalleIndividual {
  id_novedad: number;
  tipo: string;
  estado: string;
  tienda: string;
  fecha: Date | null;
  cedula: string;
  nombre: string;
  detalle: string;
  jornada_actual: string;
  nueva_jornada: string;
  salario_actual: number;
  nuevo_salario: number;
  fecha_inicio: Date | null;
  fecha_fin: Date | null;
  consecutivo: string;
  respuesta: string;
  validacion: string;
  ajuste: boolean;
  fecha_pago: Date | null;
  area_responsable: string;
  categoria_inconsistencia: string;
  responsable_validacion: string;
  concepto: string;
  codigo_concepto: number | null;
  unidades: number | null;
  fecha_novedad: Date | null;
  fecha_inicio_disfrute: Date | null;
  fecha_fin_disfrute: Date | null;
  dias: number;
}

@Injectable()
export class NovedadeService {
  constructor(
    private prisma: PrismaService,
    private notificacionService: NotificacionService,
    private correoLogService: CorreoLogService,
  ) { }

  async crearNovedad(params: {
    idUsuario: number;
    descripcion: string;
    idEstado: number;
    idTipoNovedad?: number;
    esMasiva?: boolean;
    cantidadSolicitudes?: number;
  }) {
    const {
      idUsuario,
      descripcion,
      idEstado,
      idTipoNovedad,
      esMasiva = false,
      cantidadSolicitudes = null,
    } = params;

    // Validación defensiva para evitar foreign key constraint errors
    if (!idTipoNovedad) {
      throw new Error(
        '❌ No se puede crear una novedad sin un tipo válido (idTipoNovedad es obligatorio)',
      );
    }

    const novedad = await this.prisma.novedad.create({
      data: {
        id_usuario: idUsuario,
        descripcion,
        id_estado_novedad: idEstado,
        id_tipo_novedad: idTipoNovedad,
        es_masiva: esMasiva,
        cantidad_solicitudes: cantidadSolicitudes,
        fecha_creacion: (() => {
          const fecha = new Date();
          fecha.setHours(0, 0, 0, 0);
          return fecha;
        })(),
      },
    });

    // Crear registro inicial en el historial
    await this.prisma.historial_novedad.create({
      data: {
        id_novedad: novedad.id_novedad,
        id_estado_novedad: idEstado,
        id_usuario_modificacion: idUsuario,
        comentario: 'Novedad creada',
        fecha_modificacion: new Date(),
      },
    });

    console.log(`✅ Historial creado para novedad ${novedad.id_novedad}`);

    console.log(`✅ Historial creado para novedad ${novedad.id_novedad}`);

    // 🔔 Crear Notificación
    await this.notificacionService.crearNotificacion({
      id_usuario: idUsuario,
      id_novedad: novedad.id_novedad,
      mensaje: `Nueva novedad creada: ${descripcion}`,
    });

    // 📧 Enviar Correo (Simulado)
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
    });
    if (usuario?.correo) {
      await this.correoLogService.enviarCorreo(
        usuario.correo,
        'Novedad Creada',
        `Se ha creado la novedad: ${descripcion}`,
        undefined, // idNotificacion opcional
      );
    }

    return novedad;
  }

  async crearNovedadIndividual(
    body: CrearNovedadIndividual,
    user: AuthenticatedRequest['user'],
  ) {
    const rol = {
      esNomina: user.esNomina,
      esJefe: user.esJefe,
    };

    const mensaje = getMensajePorEstadoBackendPorId(1, rol);

    const mapaTiposNovedad: Record<string, number> = {
      'Auxilio de transporte': 1,
      'Horas Extra': 2,
      Vacaciones: 3,
      'Otro Si Temporal': 4,
      'Otro Si Definitivo': 5,
      Descuento: 6,
      Otros: 7,
    };

    const idTipoNovedad = mapaTiposNovedad[body.titulo] ?? null;

    const novedad = await this.crearNovedad({
      idUsuario: user.id_usuario,
      descripcion: mensaje,
      idEstado: 1,
      idTipoNovedad,
      esMasiva: false,
      cantidadSolicitudes: 1,
    });

    await this.prisma.detalleNovedadMasiva.create({
      data: {
        id_novedad: novedad.id_novedad,
        n: 1,
        fecha: body.fecha ? new Date(body.fecha) : new Date(),
        cedula: body.cedula,
        nombre: body.nombre,
        categoria: body.titulo,
        tienda: body.tienda || user.nombreTienda,
        jefe: body.jefe || user.nombre,
        detalle: body.detalle,
      },
    });

    return {
      valido: true,
      message: '✅ Novedad individual registrada correctamente',
      usuario: user.nombre,
      novedadId: novedad.id_novedad,
    };
  }

  async obtenerNovedadesUsuarios(idUsuario: number, esJefe: boolean) {
    const selectConfig = {
      id_novedad: true,
      descripcion: true,
      fecha_creacion: true,
      es_masiva: true,
      cantidad_solicitudes: true,
      estado_novedad: {
        select: {
          nombre_estado: true,
        },
      },
      tipo_novedad: {
        select: {
          nombre_tipo: true,
        },
      },
      usuario: {
        select: {
          usuario_tienda: {
            select: {
              tienda: {
                select: {
                  nombre_tienda: true,
                },
              },
            },
          },
        },
      },
    };

    const orderByConfig = {
      fecha_creacion: 'desc' as const,
    };

    if (esJefe) {
      return this.prisma.novedad.findMany({
        select: selectConfig,
        orderBy: orderByConfig,
        where: {
          usuario: {
            usuario_tienda: {
              some: {
                id_usuario: idUsuario,
              },
            },
          },
        },
      });
    }

    return this.prisma.novedad.findMany({
      select: selectConfig,
      orderBy: orderByConfig,
    });
  }

  async obtenerDetalleMasivo(idNovedad: number) {
    return this.prisma.detalleNovedadMasiva.findMany({
      where: { id_novedad: idNovedad },
      select: {
        id_novedad: true,
        n: true,
        fecha: true,
        cedula: true,
        nombre: true,
        categoria: true,
        tienda: true,
        jefe: true,
        detalle: true,
        jornada_empleado: true,
        jornada_otro_si: true,
        fecha_inicio: true,
        fecha_fin: true,
        salario_actual: true,
        salario_otro_si: true,
        consecutivo_forms: true,
        concepto: true,
        codigo_concepto: true,
        unidades: true,
        fecha_novedad: true,
        dias_a_tomar: true,
        fecha_inicio_disfrute: true,
        fecha_fin_disfrute: true,
        responsable_validacion: true,
        respuesta_validacion: true,
        ajuste: true,
        fecha_pago: true,
        area_responsable: true,
        categoria_inconsistencia: true,
      },
    });
  }

  async obtenerDetalleMasivoPorTienda(
    idUsuario: number,
    esNomina: boolean,
    esJefe: boolean,
    filtros: FiltrosTienda = {},
  ) {
    let nombreTienda: string | undefined;

    // 1. Si es JEFE, forzamos su tienda asignada
    if (esJefe) {
      const usuarioConTienda = await this.prisma.usuario.findUnique({
        where: { id_usuario: idUsuario },
        select: {
          usuario_tienda: {
            select: {
              tienda: {
                select: {
                  nombre_tienda: true,
                },
              },
            },
          },
        },
      });
      nombreTienda = usuarioConTienda?.usuario_tienda[0]?.tienda?.nombre_tienda;

      // Si es jefe y no tiene tienda, no ve nada
      if (!nombreTienda) return [];
    }

    // 2. Construimos el WHERE
    const whereCondition: Record<string, unknown> = {};

    // Si es JEFE, filtramos por su tienda obligatoriamente
    if (esJefe && nombreTienda) {
      whereCondition.tienda = nombreTienda;
    }

    // Si es NÓMINA, no forzamos tienda, PERO si viene en filtros, la usamos
    // (Esto permite que Nómina vea TODO o filtre por una tienda específica)
    /* 
       NOTA: El frontend puede mandar filtros.tienda si hay un dropdown de tiendas.
       Si no manda nada, Nómina ve todas.
    */

    console.log(
      '🧪 whereCondition antes de Prisma.findMany():',
      whereCondition,
    );

    if (filtros.tipo) {
      whereCondition.categoria = {
        equals: filtros.tipo,
        mode: 'insensitive',
      };
    }

    if (filtros.cedula) {
      whereCondition.cedula = filtros.cedula;
    }

    if (filtros.fecha) {
      const fechaFiltro: { gte?: Date; lte?: Date } = {};

      if (filtros.fecha.gte) {
        const gteDate = new Date(filtros.fecha.gte);
        fechaFiltro.gte = new Date(
          Date.UTC(
            gteDate.getFullYear(),
            gteDate.getMonth(),
            gteDate.getDate(),
            0,
            0,
            0,
            0,
          ),
        );
      }

      if (filtros.fecha.lte) {
        const lteDate = new Date(filtros.fecha.lte);
        fechaFiltro.lte = new Date(
          Date.UTC(
            lteDate.getFullYear(),
            lteDate.getMonth(),
            lteDate.getDate(),
            23,
            59,
            59,
            999,
          ),
        );
      }

      console.log('🎯 Fecha final para Prisma (UTC):', fechaFiltro);

      if (fechaFiltro.gte || fechaFiltro.lte) {
        whereCondition.fecha = fechaFiltro;
      }

      if (fechaFiltro.gte || fechaFiltro.lte) {
        console.log(
          '📅 Usando fechaFiltro CORREGIDO (sin alterar UTC):',
          fechaFiltro,
        );
        whereCondition.fecha = fechaFiltro;
      }
    }

    const resultados = await this.prisma.detalleNovedadMasiva.findMany({
      where: whereCondition,
      orderBy: {
        id_novedad: 'asc',
      },
      select: {
        id_novedad: true,
        n: true,
        fecha: true,
        cedula: true,
        nombre: true,
        categoria: true,
        tienda: true,
        jefe: true,
        detalle: true,
        jornada_empleado: true,
        jornada_otro_si: true,
        fecha_inicio: true,
        fecha_fin: true,
        salario_actual: true,
        salario_otro_si: true,
        consecutivo_forms: true,
        concepto: true,
        codigo_concepto: true,
        unidades: true,
        fecha_novedad: true,
        dias_a_tomar: true,
        fecha_inicio_disfrute: true,
        fecha_fin_disfrute: true,
        responsable_validacion: true,
        respuesta_validacion: true,
        ajuste: true,
        fecha_pago: true,
        area_responsable: true,
        categoria_inconsistencia: true,
      },
    });

    resultados.forEach((r) => {
      console.log('📌 fecha:', r.fecha?.toISOString());
    });

    console.log(
      '📦 Resultados con filtros para tienda:',
      nombreTienda,
      '| Total:',
      resultados.length,
    );

    return resultados.map((item) => ({
      ...item,
      cedula: item.cedula?.toString() ?? null,
    }));
  }

  async obtenerDetalleIndividual(
    idNovedad: number,
  ): Promise<DetalleIndividual> {
    const novedad = await this.prisma.novedad.findUnique({
      where: { id_novedad: idNovedad },
      select: {
        id_novedad: true,
        id_estado_novedad: true,
        id_tipo_novedad: true,
        fecha_creacion: true,
        es_masiva: true,
        descripcion: true,
        estado_novedad: {
          select: {
            nombre_estado: true,
          },
        },
        tipo_novedad: {
          select: {
            nombre_tipo: true,
          },
        },
        usuario: {
          select: {
            usuario_tienda: {
              select: {
                tienda: {
                  select: {
                    nombre_tienda: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!novedad) {
      throw new NotFoundException(`Novedad #${idNovedad} no encontrada`);
    }

    if (novedad.es_masiva) {
      throw new NotFoundException(
        `La novedad #${idNovedad} es masiva. Usa el endpoint de masivas.`,
      );
    }

    const detalle = await this.prisma.detalleNovedadMasiva.findFirst({
      where: { id_novedad: idNovedad },
      select: {
        cedula: true,
        nombre: true,
        detalle: true,
        jornada_empleado: true,
        jornada_otro_si: true,
        salario_actual: true,
        salario_otro_si: true,
        fecha_inicio: true,
        fecha_fin: true,
        consecutivo_forms: true,
        concepto: true,
        codigo_concepto: true,
        unidades: true,
        fecha_novedad: true,
        dias_a_tomar: true,
        fecha_inicio_disfrute: true,
        fecha_fin_disfrute: true,

        respuesta_validacion: true,
        responsable_validacion: true,
        ajuste: true,
        fecha_pago: true,
        area_responsable: true,
        categoria_inconsistencia: true,
      },
    });

    return {
      id_novedad: novedad.id_novedad,
      tipo: novedad.tipo_novedad?.nombre_tipo ?? 'Sin tipo',
      estado: novedad.estado_novedad?.nombre_estado ?? 'Sin estado',
      tienda:
        novedad.usuario?.usuario_tienda?.[0]?.tienda?.nombre_tienda ??
        'Sin tienda',

      //LOS QUE SE REPITEN
      fecha: novedad.fecha_creacion,
      cedula: detalle?.cedula?.toString() ?? '',
      nombre: detalle?.nombre ?? '',
      detalle: detalle?.detalle ?? '',

      //OTRO SI TEMPORAL
      jornada_actual: detalle?.jornada_empleado ?? '',
      nueva_jornada: detalle?.jornada_otro_si ?? '',
      salario_actual: detalle?.salario_actual ?? 0,
      nuevo_salario: detalle?.salario_otro_si ?? 0,
      fecha_inicio: detalle?.fecha_inicio ?? null,
      fecha_fin: detalle?.fecha_fin ?? null,
      consecutivo: detalle?.consecutivo_forms ?? '',

      //HORAS EXTRA
      concepto: detalle?.concepto ?? '',
      codigo_concepto: detalle?.codigo_concepto ?? null,
      unidades: detalle?.unidades ?? null,
      fecha_novedad: detalle?.fecha_novedad ?? null,

      //VACACIONES
      dias: detalle?.dias_a_tomar ?? 0,
      fecha_inicio_disfrute: detalle?.fecha_inicio_disfrute ?? null,
      fecha_fin_disfrute: detalle?.fecha_fin_disfrute ?? null,

      // ✅ Datos de Nómina
      respuesta: detalle?.respuesta_validacion ?? '',
      validacion: detalle?.respuesta_validacion ?? '',
      ajuste: detalle?.ajuste === 'true',
      fecha_pago: detalle?.fecha_pago ?? null,
      area_responsable: detalle?.area_responsable ?? '',
      categoria_inconsistencia: detalle?.categoria_inconsistencia ?? '',
      responsable_validacion: detalle?.responsable_validacion ?? '',
    };
  }

  async buscarCedulas(q?: string, nombreTienda?: string, esNomina?: boolean) {
    if (!q || isNaN(Number(q))) return [];

    // Si es de nómina, retorna todas las coincidencias
    if (esNomina) {
      return await this.prisma.$queryRaw<
        { cedula: number; nombre: string }[]
      >(Prisma.sql`
      SELECT DISTINCT cedula, nombre
      FROM "detalle_novedad_masiva"
      WHERE CAST(cedula AS TEXT) LIKE ${q + '%'}
      LIMIT 10
    `);
    }

    // Si es de tienda, filtra por nombre de tienda
    if (nombreTienda) {
      return await this.prisma.$queryRaw<
        { cedula: number; nombre: string }[]
      >(Prisma.sql`
      SELECT DISTINCT cedula, nombre
      FROM "detalle_novedad_masiva"
      WHERE tienda = ${nombreTienda}
        AND CAST(cedula AS TEXT) LIKE ${q + '%'}
      LIMIT 10
    `);
    }

    return [];
  }

  async obtenerNovedadesPendientesParaNomina(filtros: FiltrosParaNomina = {}) {
    const whereCondition: Record<string, any> = {
      estado_novedad: {
        nombre_estado: 'CREADA',
      },
    };

    // Filtro por tipo
    if (filtros.tipo) {
      whereCondition.tipo_novedad = {
        nombre_tipo: {
          equals: filtros.tipo,
          mode: 'insensitive',
        },
      };
    }

    // Filtro por tienda
    if (filtros.tienda) {
      whereCondition.usuario = {
        usuario_tienda: {
          some: {
            tienda: {
              nombre_tienda: {
                equals: filtros.tienda,
                mode: 'insensitive',
              },
            },
          },
        },
      };
    }

    //Filtro por fecha de creación
    if (filtros.fecha) {
      const fechaFiltro: { gte?: Date; lte?: Date } = {};

      if (filtros.fecha.gte) {
        const gte = new Date(filtros.fecha.gte);
        fechaFiltro.gte = new Date(
          gte.getFullYear(),
          gte.getMonth(),
          gte.getDate(),
          0,
          0,
          0,
          0,
        );
      }

      if (filtros.fecha.lte) {
        const lte = new Date(filtros.fecha.lte);
        fechaFiltro.lte = new Date(
          lte.getFullYear(),
          lte.getMonth(),
          lte.getDate(),
          23,
          59,
          59,
          999,
        );
      }

      if (fechaFiltro.gte || fechaFiltro.lte) {
        whereCondition.fecha_creacion = fechaFiltro;
      }
    }

    return this.prisma.novedad.findMany({
      where: whereCondition,
      orderBy: {
        id_novedad: 'desc',
      },
      select: {
        id_novedad: true,
        descripcion: true,
        fecha_creacion: true,
        es_masiva: true,
        cantidad_solicitudes: true,
        estado_novedad: {
          select: {
            nombre_estado: true,
          },
        },
        tipo_novedad: {
          select: {
            nombre_tipo: true,
          },
        },
        usuario: {
          select: {
            usuario_tienda: {
              select: {
                tienda: {
                  select: {
                    nombre_tienda: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async obtenerDetallesParaConsolidado(filtros: FiltrosParaNomina = {}) {
    const whereCondition: Record<string, any> = {};

    if (filtros.tienda) {
      whereCondition.tienda = {
        equals: filtros.tienda,
        mode: 'insensitive',
      };
    }

    if (filtros.tipo) {
      whereCondition.categoria = {
        equals: filtros.tipo,
        mode: 'insensitive',
      };
    }

    if (filtros.fecha) {
      const fechaFiltro: { gte?: Date; lte?: Date } = {};

      if (filtros.fecha.gte) {
        fechaFiltro.gte = new Date(
          filtros.fecha.gte.getFullYear(),
          filtros.fecha.gte.getMonth(),
          filtros.fecha.gte.getDate(),
          0,
          0,
          0,
          0,
        );
      }

      if (filtros.fecha.lte) {
        fechaFiltro.lte = new Date(
          filtros.fecha.lte.getFullYear(),
          filtros.fecha.lte.getMonth(),
          filtros.fecha.lte.getDate(),
          23,
          59,
          59,
          999,
        );
      }

      if (fechaFiltro.gte || fechaFiltro.lte) {
        whereCondition.fecha = fechaFiltro;
      }
    }

    if (filtros.cedula) {
      whereCondition.cedula = filtros.cedula;
    }

    const resultados = await this.prisma.detalleNovedadMasiva.findMany({
      where: whereCondition,
      orderBy: { id_novedad: 'asc' },
      select: {
        id_novedad: true,
        n: true,
        fecha: true,
        cedula: true,
        nombre: true,
        categoria: true,
        tienda: true,
        jefe: true,
        detalle: true,
        jornada_empleado: true,
        jornada_otro_si: true,
        fecha_inicio: true,
        fecha_fin: true,
        salario_actual: true,
        salario_otro_si: true,
        consecutivo_forms: true,
        concepto: true,
        codigo_concepto: true,
        unidades: true,
        fecha_novedad: true,
        dias_a_tomar: true,
        fecha_inicio_disfrute: true,
        fecha_fin_disfrute: true,
        responsable_validacion: true,
        respuesta_validacion: true,
        ajuste: true,
        fecha_pago: true,
        area_responsable: true,
        categoria_inconsistencia: true,
      },
    });

    return resultados.map((item) => ({
      ...item,
      cedula: item.cedula?.toString() ?? null,
    }));
  }

  async cambiarEstadoNovedad(
    idNovedad: number,
    nuevoEstadoId: number,
    idUsuario: number,
    descripcion: string,
  ) {
    const estadoMap: Record<number, string> = {
      1: 'CREADA',
      2: 'EN GESTIÓN',
      3: 'GESTIONADA',
    };

    const estadoStr = estadoMap[nuevoEstadoId] ?? 'DESCONOCIDO';

    await this.prisma.novedad.update({
      where: { id_novedad: idNovedad },
      data: {
        id_estado_novedad: nuevoEstadoId,
        descripcion,
      },
    });

    await this.prisma.historial_novedad.create({
      data: {
        id_novedad: idNovedad,
        id_estado_novedad: nuevoEstadoId,
        id_usuario_modificacion: idUsuario,
        comentario: `Estado cambiado a "${estadoStr}" por ${descripcion.includes('TIENDA') ? 'TIENDA' : 'NÓMINA'
          }`,
      },
    });

    // 🔔 Crear Notificación
    await this.notificacionService.crearNotificacion({
      id_usuario: idUsuario, // Notificar al que hizo el cambio (o al dueño de la novedad, lógica a definir)
      id_novedad: idNovedad,
      mensaje: `Estado de novedad actualizado a: ${estadoStr}`,
    });

    // 📧 Enviar Correo (Simulado)
    // Buscar usuario dueño de la novedad para notificarle
    const novedad = await this.prisma.novedad.findUnique({
      where: { id_novedad: idNovedad },
      include: { usuario: true },
    });

    if (novedad?.usuario?.correo) {
      await this.correoLogService.enviarCorreo(
        novedad.usuario.correo,
        `Actualización de Novedad #${idNovedad}`,
        `El estado ha cambiado a: ${estadoStr}. Comentario: ${descripcion}`,
        undefined,
      );
    }

    return { success: true, message: 'Estado actualizado correctamente' };
  }

  async obtenerTodasNovedadesParaNomina(filtros: FiltrosParaNomina) {
    return this.prisma.novedad.findMany({
      where: {
        ...(filtros.tienda && {
          usuario: {
            usuario_tienda: {
              some: {
                tienda: {
                  nombre_tienda: {
                    contains: filtros.tienda,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        }),
        ...(filtros.tipo && {
          tipo_novedad: {
            nombre_tipo: {
              contains: filtros.tipo,
              mode: 'insensitive',
            },
          },
        }),
        ...(filtros.fecha && {
          fecha_creacion: filtros.fecha,
        }),
      },
      include: {
        estado_novedad: true,
        tipo_novedad: true,
        usuario: {
          include: {
            usuario_tienda: {
              include: {
                tienda: true,
              },
            },
          },
        },
      },
      orderBy: {
        id_novedad: 'desc',
      },
    });
  }

  async obtenerDetallesPendientesParaNomina(filtros: FiltrosParaNomina = {}) {
    const whereCondition: Record<string, any> = {
      novedad: {
        id_estado_novedad: {
          in: [1, 2], // 1: CREADA, 2: EN GESTIÓN
        },
      },
    };

    if (filtros.tienda) {
      whereCondition.tienda = {
        equals: filtros.tienda,
        mode: 'insensitive',
      };
    }

    if (filtros.tipo) {
      whereCondition.categoria = {
        equals: filtros.tipo,
        mode: 'insensitive',
      };
    }

    if (filtros.cedula) {
      whereCondition.cedula = filtros.cedula;
    }

    if (filtros.fecha) {
      const fechaFiltro: { gte?: Date; lte?: Date } = {};

      if (filtros.fecha.gte) {
        fechaFiltro.gte = new Date(
          filtros.fecha.gte.getFullYear(),
          filtros.fecha.gte.getMonth(),
          filtros.fecha.gte.getDate(),
          0,
          0,
          0,
          0,
        );
      }

      if (filtros.fecha.lte) {
        fechaFiltro.lte = new Date(
          filtros.fecha.lte.getFullYear(),
          filtros.fecha.lte.getMonth(),
          filtros.fecha.lte.getDate(),
          23,
          59,
          59,
          999,
        );
      }

      if (fechaFiltro.gte || fechaFiltro.lte) {
        whereCondition.fecha = fechaFiltro;
      }
    }

    const resultados = await this.prisma.detalleNovedadMasiva.findMany({
      where: whereCondition,
      orderBy: { id_novedad: 'asc' },
      select: {
        id_novedad: true,
        n: true,
        fecha: true,
        cedula: true,
        nombre: true,
        categoria: true,
        tienda: true,
        jefe: true,
        detalle: true,
        jornada_empleado: true,
        jornada_otro_si: true,
        fecha_inicio: true,
        fecha_fin: true,
        salario_actual: true,
        salario_otro_si: true,
        consecutivo_forms: true,
        concepto: true,
        codigo_concepto: true,
        unidades: true,
        fecha_novedad: true,
        dias_a_tomar: true,
        fecha_inicio_disfrute: true,
        fecha_fin_disfrute: true,
        responsable_validacion: true,
        respuesta_validacion: true,
        ajuste: true,
        fecha_pago: true,
        area_responsable: true,
        categoria_inconsistencia: true,
      },
    });

    return resultados.map((item) => ({
      ...item,
      cedula: item.cedula?.toString() ?? null,
    }));
  }

  async cambiarMultiplesEstados(
    idsNovedades: number[],
    nuevoEstadoId: number,
    idUsuario: number,
    esTienda: boolean,
  ) {
    const estadoMap: Record<number, string> = {
      1: 'CREADA',
      2: 'EN GESTIÓN',
      3: 'GESTIONADA',
    };

    const estadoStr = estadoMap[nuevoEstadoId] ?? 'DESCONOCIDO';

    for (const id of idsNovedades) {
      const nuevaDescripcion = getMensajePorEstadoBackendPorId(nuevoEstadoId, {
        esNomina: !esTienda,
        esJefe: esTienda, // o false si no aplica
      });

      // Cambiar estado + descripción
      await this.prisma.novedad.update({
        where: { id_novedad: id },
        data: {
          id_estado_novedad: nuevoEstadoId,
          descripcion: nuevaDescripcion,
        },
      });

      // Registrar historial
      await this.prisma.historial_novedad.create({
        data: {
          id_novedad: id,
          id_estado_novedad: nuevoEstadoId,
          id_usuario_modificacion: idUsuario,
          comentario: `Estado cambiado a "${estadoStr}" por ${esTienda ? 'TIENDA' : 'NÓMINA'}`,
        },
      });

      // 🔔 Crear Notificación
      await this.notificacionService.crearNotificacion({
        id_usuario: idUsuario,
        id_novedad: id,
        mensaje: `Estado de novedad masiva actualizado a: ${estadoStr}`,
      });

      // 📧 Enviar Correo (Simulado)
      const novedad = await this.prisma.novedad.findUnique({
        where: { id_novedad: id },
        include: { usuario: true },
      });

      if (novedad?.usuario?.correo) {
        await this.correoLogService.enviarCorreo(
          novedad.usuario.correo,
          `Actualización de Novedad #${id}`,
          `El estado ha cambiado a: ${estadoStr}.`,
          undefined,
        );
      }
    }

    return {
      success: true,
      message: `Se actualizaron ${idsNovedades.length} novedades correctamente.`,
    };
  }

  // Método alternativo MÁS ROBUSTO (recomendado usar este)
  async existeDuplicadoRobusto(input: {
    cedula: number;
    tipo: string;
    fecha: string; // '2025-07-03 05:00:00'
  }): Promise<boolean> {
    try {
      console.log('🔍 [SERVICE-ROBUSTO] Iniciando validación:', input);

      const [fechaParte, horaParte] = input.fecha.split(' ');
      const [anio, mes, dia] = fechaParte.split('-').map(Number);
      const [hora, minuto, segundo] = horaParte.split(':').map(Number);

      // ⚠️ OJO: mes en Date.UTC empieza desde 0 (enero)
      const fechaExacta = new Date(
        Date.UTC(anio, mes - 1, dia, hora, minuto, segundo),
      );

      console.log(
        '📅 [SERVICE-ROBUSTO] Fecha ISO local para consulta:',
        fechaExacta,
      );

      const where: Prisma.DetalleNovedadMasivaWhereInput = {
        cedula: input.cedula ?? undefined,
        categoria: input.tipo,
        fecha: fechaExacta, // esto crea un Date válido para Prisma
      };

      console.log('🔍 [SERVICE-ROBUSTO] Query WHERE:', where);

      const fechaDesde = new Date(fechaExacta);
      fechaDesde.setSeconds(0, 0);

      const fechaHasta = new Date(fechaExacta);
      fechaHasta.setSeconds(59, 999);

      const resultado = await this.prisma.detalleNovedadMasiva.findFirst({
        where: {
          cedula: Number(input.cedula),
          categoria: input.tipo,
          fecha: {
            gte: fechaDesde,
            lte: fechaHasta,
          },
        },
        select: {
          cedula: true,
          fecha: true,
          categoria: true,
        },
      });

      console.log('🔍 [SERVICE-ROBUSTO] Resultado búsqueda:', resultado);

      return resultado !== null;
    } catch (error) {
      console.error('❌ [SERVICE-ROBUSTO] Error al validar duplicado:', error);
      return false;
    }
  }

  async guardarRespuestaIndividual(
    idDetalle: number,
    data: {
      respuesta_validacion: string;
      responsable_validacion: string;
      ajuste: string;
      fecha_pago: string;
      area_responsable: string;
      categoria_inconsistencia: string;
    },
  ): Promise<{ mensaje: string }> {
    const detalle = await this.prisma.detalleNovedadMasiva.findUnique({
      where: { id_detalle: idDetalle },
      include: { novedad: true },
    });

    if (!detalle || detalle.novedad.id_estado_novedad !== 2) {
      throw new Error(
        '❌ Detalle no encontrado o no está en estado EN GESTIÓN',
      );
    }

    await this.prisma.detalleNovedadMasiva.update({
      where: { id_detalle: idDetalle },
      data: {
        respuesta_validacion: data.respuesta_validacion,
        responsable_validacion: data.responsable_validacion,
        ajuste: data.ajuste,
        fecha_pago: new Date(data.fecha_pago),
        area_responsable: data.area_responsable,
        categoria_inconsistencia: data.categoria_inconsistencia,
      },
    });

    // Verificamos si todos los detalles están completados
    const detalles = await this.prisma.detalleNovedadMasiva.findMany({
      where: { id_novedad: detalle.id_novedad },
    });

    const todosListos = detalles.every(
      (d) => d.respuesta_validacion && d.respuesta_validacion.trim() !== '',
    );

    if (todosListos) {
      await this.prisma.novedad.update({
        where: { id_novedad: detalle.id_novedad },
        data: { id_estado_novedad: 3 }, // GESTIONADA
      });
    }

    return { mensaje: '✅ Respuesta guardada correctamente.' };
  }
}
