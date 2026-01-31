import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto'; // Crearemos esto en un momento
import { RegisterDto } from './dto/register.dto'; // Y esto también

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // REGISTRO
  async register(registerDto: RegisterDto) {
    // 1. Encriptar contraseña (10 rondas de sal)
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 2. Crear usuario
    return this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
      },
    });
  }

  // LOGIN
  async login(loginDto: LoginDto) {
    // 1. Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    // 2. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Credenciales inválidas');

    // 3. Generar Token
    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, name: user.name, email: user.email }, // Devolvemos info básica
    };
  }
}
