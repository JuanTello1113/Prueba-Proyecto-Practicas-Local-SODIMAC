import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class CrearUsuarioDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre es requerido' })
    nombre!: string;

    @IsEmail({}, { message: 'Debe ser un correo válido' })
    @IsNotEmpty({ message: 'El correo es requerido' })
    correo!: string;

    @IsString()
    @IsNotEmpty({ message: 'El rol es requerido' })
    rol!: string;

    @IsOptional()
    @IsString()
    tienda?: string;
}
