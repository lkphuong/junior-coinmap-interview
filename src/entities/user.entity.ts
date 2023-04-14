import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { RootEntity } from './root.entity';

@Entity('users')
export class UserEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    name: 'email',
    nullable: false,
    length: 255,
  })
  email: string;

  @Column('varchar', {
    name: 'password',
    nullable: false,
    length: 500,
  })
  password: string;
}
