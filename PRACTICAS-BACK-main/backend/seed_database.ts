import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
    console.log('\n🌱 Iniciando seed...\n');

    try {
        // 1. Estados
        console.log('📝 Creando estados...');
        await prisma.$executeRaw`INSERT INTO estado_novedad (id_estado_novedad, nombre_estado) VALUES (1, 'CREADA') ON CONFLICT DO NOTHING`;
        await prisma.$executeRaw`INSERT INTO estado_novedad (id_estado_novedad, nombre_estado) VALUES (2, 'EN GESTIÓN') ON CONFLICT DO NOTHING`;
        await prisma.$executeRaw`INSERT INTO estado_novedad (id_estado_novedad, nombre_estado) VALUES (3, 'GESTIONADA') ON CONFLICT DO NOTHING`;
        console.log('  ✓ Estados creados');

        // 2. Tipos
        console.log('\n📝 Creando tipos...');
        await prisma.$executeRaw`INSERT INTO tipo_novedad (id_tipo_novedad, nombre_tipo) VALUES (1, 'Auxilio de transporte') ON CONFLICT DO NOTHING`;
        await prisma.$executeRaw`INSERT INTO tipo_novedad (id_tipo_novedad, nombre_tipo) VALUES (2, 'Horas Extra') ON CONFLICT DO NOTHING`;
        await prisma.$executeRaw`INSERT INTO tipo_novedad (id_tipo_novedad, nombre_tipo) VALUES (3, 'Vacaciones') ON CONFLICT DO NOTHING`;
        await prisma.$executeRaw`INSERT INTO tipo_novedad (id_tipo_novedad, nombre_tipo) VALUES (4, 'Otro Si Temporal') ON CONFLICT DO NOTHING`;
        await prisma.$executeRaw`INSERT INTO tipo_novedad (id_tipo_novedad, nombre_tipo) VALUES (5, 'Otro Si Definitivo') ON CONFLICT DO NOTHING`;
        await prisma.$executeRaw`INSERT INTO tipo_novedad (id_tipo_novedad, nombre_tipo) VALUES (6, 'Descuento') ON CONFLICT DO NOTHING`;
        await prisma.$executeRaw`INSERT INTO tipo_novedad (id_tipo_novedad, nombre_tipo) VALUES (7, 'Otros') ON CONFLICT DO NOTHING`;
        console.log('  ✓ Tipos creados');

        console.log('\n✅ Seed completado!\n');
    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
