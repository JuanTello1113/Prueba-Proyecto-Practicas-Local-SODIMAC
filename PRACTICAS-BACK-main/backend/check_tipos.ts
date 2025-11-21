import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== VERIFICANDO BASE DE DATOS ===\n');

  const tiposNovedad = await prisma.tipo_novedad.findMany({
    orderBy: { id_tipo_novedad: 'asc' },
  });

  console.log('TIPOS DE NOVEDAD:');
  if (tiposNovedad.length === 0) {
    console.log('❌ NO HAY TIPOS DE NOVEDAD EN LA BASE DE DATOS');
  } else {
    tiposNovedad.forEach((tipo) => {
      console.log(`  [${tipo.id_tipo_novedad}] "${tipo.nombre_tipo}"`);
    });
  }

  console.log('\nESTADOS DE NOVEDAD:');
  const estadosNovedad = await prisma.estado_novedad.findMany({
    orderBy: { id_estado_novedad: 'asc' },
  });

  if (estadosNovedad.length === 0) {
    console.log('❌ NO HAY ESTADOS DE NOVEDAD EN LA BASE DE DATOS');
  } else {
    estadosNovedad.forEach((estado) => {
      console.log(`  [${estado.id_estado_novedad}] "${estado.nombre_estado}"`);
    });
  }

  console.log('\n=================================\n');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
