import {
  Inject,
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from './entities/user.entity';
import { AuthService } from '@/auth/auth.service';
import { SignupDto } from '@/users/dto/signup.dto';
import { SigninDto } from '@/users/dto/signin.dto';
import UserUpdateDto from '@/users/dto/userUpdateDto';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @Inject()
  private readonly authService: AuthService;

  public async signup(signupDto: SignupDto) {
    const user = this.userRepository.create(signupDto);
    return this.userRepository.save(user);
  }

  public async signin(
    signinDto: SigninDto,
  ): Promise<{ name: string; jwtToken: string; cpf: string }> {
    const user = await this.findByCpf(signinDto.cpf);
    const match = await this.checkPassword(signinDto.password, user);

    if (!match) throw new NotFoundException('Invalid credentials.');

    const jwtToken = await this.authService.createAccessToken(user.id);

    return { name: user.name, jwtToken, cpf: user.cpf };
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(cpf: string) {
    const user = await this.userRepository.findOne({
      where: { cpf },
    });

    if (!user) throw new NotFoundException(`User with CPF ${cpf} not found.`);

    return user;
  }

  async update(cpf: string, userDto: UserUpdateDto) {
    let user = await this.userRepository.findOne({ where: { cpf } });

    if (!user) throw new NotFoundException(`User with CPF ${cpf} not found.`);

    user = await this.userRepository.preload({
      ...user,
      ...userDto,
    });

    if (!user) throw new NotFoundException(`User with CPF ${cpf} not found.`);

    return this.userRepository.save(user);
  }

  async remove(cpf: string) {
    const user = await this.userRepository.findOne({ where: { cpf } });

    if (!user) throw new NotFoundException(`User with CPF ${cpf} not found.`);

    user.status = UserStatus.REMOVED;
    return await this.userRepository.save(user);
  }

  private async findByCpf(cpf: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { cpf } });

    if (!user) throw new NotFoundException('CPF not found.');

    return user;
  }

  private async checkPassword(password: string, user: User): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  async onApplicationBootstrap() {
    let user = await this.userRepository.findOne({ where: { cpf: '99999999999' } });

    if (!user) {
      user = this.userRepository.create({
        name: 'Admin',
        cpf: '99999999999',
        password: 'admin',
        status: UserStatus.ADMIN,
      });

      await this.userRepository.save(user);
    }
  }
}
