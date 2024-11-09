import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { decode, sign } from 'jsonwebtoken';
import * as process from 'process';

import { JwtPayload } from './models/jwt-payload.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';

type PayloadType = {
  userId: string;
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  private static token: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async createAccessToken(userId: string): Promise<string> {
    return sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });
  }

  public async validateUser(jwtPayload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({ where: { cpf: jwtPayload.cpf } });

    if (!user) throw new UnauthorizedException('User not found.');

    return user;
  }

  public returnJwtExtractor(): (request: Request) => string {
    return AuthService.jwtExtractor;
  }

  public async returnLoggedUser(): Promise<User> {
    const userId = decode(AuthService.token) as PayloadType;
    return await this.userRepository.findOne({ where: { id: userId.userId as string } });
  }

  private static jwtExtractor(request: Request): string {
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new BadRequestException('Bad request.');

    const [, token] = authHeader.split(' ');

    AuthService.token = token;

    return token;
  }
}
