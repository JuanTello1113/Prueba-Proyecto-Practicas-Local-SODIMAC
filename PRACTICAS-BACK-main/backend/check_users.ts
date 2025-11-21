import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.usuario.findMany({
        include: {
            usuario_rol: {
                include: {
                    rol: true,
                },
            },
        },
    });

    console.log('--- LISTA DE USUARIOS ---');
    users.forEach((user) => {
        console.log(`ID: ${user.id_usuario}, Nombre: ${user.nombre}, Correo: ${user.correo}`);
        if (user.usuario_rol.length > 0) {
            user.usuario_rol.forEach((ur) => {
                console.log(`  - Rol: ${ur.rol.nombre_rol} (ID Rol: ${ur.id_rol})`);
            });
        } else {
            console.log('  - ⚠️ SIN ROL ASIGNADO');
        }
        console.log('-------------------------');
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
