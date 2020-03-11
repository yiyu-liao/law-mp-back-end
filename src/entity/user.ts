import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  PrimaryColumn
} from "typeorm";

import Lawyer from "./lawyer";
import LegalAdvice from "./legal-advice";
import { type } from "os";

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  openid: string;

  @Column({ default: null })
  avatar_url: string;

  @Column({ default: null })
  nick_name: string;

  @Column({ default: null })
  real_name: string;

  @Column({ default: 0 })
  role: number; // 0 => null role, 1 => customer, 2 => lawyer

  @Column({ default: 1 })
  verify_status: number; // 1 => 未认证， 2 => 认证中， 3 => 已认证

  @OneToOne(type => Lawyer)
  @JoinColumn({ name: "extra_profile_id" })
  extra_profile: Lawyer;

  @OneToMany(
    type => LegalAdvice,
    advice => advice.advicer
  )
  advices: LegalAdvice[];
}
