import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SignupDto } from '@/users/dto/signup.dto';
import { User, UserStatus } from '@/users/entities/user.entity';
import { SigninDto } from '@/users/dto/signin.dto';
import { AuthGuard } from '@nestjs/passport';
import UserUpdateDto from '@/users/dto/userUpdateDto';
import { AuthService } from '@/auth/auth.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  public async signin(
    @Body() signinDto: SigninDto,
  ): Promise<{ name: string; jwtToken: string; cpf: string }> {
    return this.usersService.signin(signinDto);
  }

  @Post('signup')
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  public async signup(@Body() signupDto: SignupDto): Promise<User> {
    await this.isAdmin();
    return this.usersService.signup(signupDto);
  }

  @Get()
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 409, description: 'Conflito de email' })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async findAll(@Res() response: any) {
    await this.isAdmin();
    this.usersService.findAll().then((c) => response.status(200).json(c));
  }

  @Get(':cpf')
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('cpf') cpf: string) {
    await this.isValidUser(cpf);
    return this.usersService.findOne(cpf);
  }

  @Patch(':cpf')
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('cpf') cpf: string, @Body() body: UserUpdateDto) {
    await this.isValidUser(cpf);
    return this.usersService.update(cpf, body);
  }

  @Delete(':cpf')
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async remove(@Param('cpf') cpf: string) {
    await this.isValidUser(cpf);
    return this.usersService.remove(cpf);
  }

  private async isAdmin() {
    const user = await this.authService.returnLoggedUser();

    if (user == null || user.status !== UserStatus.ADMIN)
      throw new UnauthorizedException('Unauthorized.');
  }

  private async isValidUser(cpf: string) {
    const user = await this.authService.returnLoggedUser();

    if (user == null || user.status !== UserStatus.ADMIN || user.cpf !== cpf)
      throw new UnauthorizedException('Unauthorized.');
  }
}
