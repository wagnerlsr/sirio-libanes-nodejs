import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export enum UserStatus {
  ADMIN = 'admin',
  ACTIVE = 'ativo',
  REMOVED = 'removido',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  cpf: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  number_address: number;

  @Column({ nullable: true })
  additional_address: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zip_code: number;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.REMOVED,
  })
  status: UserStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  upadated_at: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date;

  @JoinColumn()
  @OneToOne(() => User)
  created_user: User;

  @JoinColumn()
  @OneToOne(() => User)
  upadated_user: User;

  @JoinColumn()
  @OneToOne(() => User)
  deleted_user: User;

  @BeforeInsert()
  generatedId() {
    if (this.id) return;
    this.id = uuidv4();
  }

  @BeforeInsert()
  @BeforeUpdate()
  async encryptPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeInsert()
  async setStatusActive() {
    if (this.status) return;
    this.status = UserStatus.ACTIVE;
  }
}
