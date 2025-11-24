import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsuarioService', () => {
    let service: UsuarioService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsuarioService,
                {
                    provide: PrismaService,
                    useValue: {
                        usuario: {
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                        usuario_rol: {
                            create: jest.fn(),
                        },
                        usuario_tienda: {
                            create: jest.fn(),
                        },
                        rol: {
                            findFirst: jest.fn(),
                        },
                        tienda: {
                            findFirst: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<UsuarioService>(UsuarioService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('listarUsuarios', () => {
        it('should return an array of users', async () => {
            const mockUsers = [
                {
                    id_usuario: 1,
                    nombre: 'Test User',
                    correo: 'test@example.com',
                    estado: true,
                    fecha_creacion: new Date('2024-01-01'),
                    ultima_actividad: new Date('2024-01-01'),
                    usuario_rol: [{ rol: { nombre_rol: 'admin' } }],
                    usuario_tienda: [],
                },
            ];

            jest.spyOn(prisma.usuario, 'findMany').mockResolvedValue(mockUsers as any);

            const result = await service.listarUsuarios();

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(prisma.usuario.findMany).toHaveBeenCalled();
        });
    });

    describe('crearUsuario', () => {
        it('should throw error when required fields are missing', async () => {
            await expect(
                service.crearUsuario({
                    nombre: '',
                    correo: 'test@example.com',
                    rol: 'admin',
                }),
            ).rejects.toThrow('Nombre, correo y rol son requeridos.');
        });

        it('should create user successfully with valid data', async () => {
            const mockRol = { id_rol: 1, nombre_rol: 'admin' };
            const mockCreatedUser = {
                id_usuario: 1,
                nombre: 'New User',
                correo: 'newuser@example.com',
            };

            jest.spyOn(prisma.rol, 'findFirst').mockResolvedValue(mockRol as any);
            jest.spyOn(prisma.usuario, 'create').mockResolvedValue(mockCreatedUser as any);
            jest.spyOn(prisma.usuario_rol, 'create').mockResolvedValue({} as any);

            const result = await service.crearUsuario({
                nombre: 'New User',
                correo: 'newuser@example.com',
                rol: 'admin',
            });

            expect(result).toBeDefined();
            expect(prisma.rol.findFirst).toHaveBeenCalled();
            expect(prisma.usuario.create).toHaveBeenCalled();
            expect(prisma.usuario_rol.create).toHaveBeenCalled();
        });
    });
});
