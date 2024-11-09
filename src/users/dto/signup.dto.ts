import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Nome do usuário' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(11)
  @ApiProperty({ description: 'CPF do usuário' })
  cpf: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @ApiProperty({ description: 'Senha do usuário' })
  password: string;
}
