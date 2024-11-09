import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class UserUpdateDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Nome do usuário' })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Endereço do usuário' })
  readonly address?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'Numero da residencia' })
  readonly number_address?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Complemento do endereço' })
  readonly additional_address?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Bairro' })
  readonly district?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Estado' })
  readonly state?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'CEP' })
  readonly zip_code?: number;
}
