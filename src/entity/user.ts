import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm"; 

import Lawyer from './lawyer';

export interface ILawyerVerifyInfo {
  real_name: string;

  office: string;

  location: string;

  experience_year: number;

  id_photo: string;

  license_photo: string;

  license_no: string;
}



@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  openid: string;

  @Column({ default: null })
  avatar: string;

  @Column({ default: null })
  nick_name: string;

  @Column({ default: null })
  real_name: string;

  @Column()
  role: number; // 1 => customer, 2 => lawyer

  @Column({ default: 1 })
  verify_status: number; // 1 => 未认证， 2 => 认证中， 3 => 已认证

  @OneToOne(type => Lawyer)
  @JoinColumn()
  extra_profile: Lawyer;
}
