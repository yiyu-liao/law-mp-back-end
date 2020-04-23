import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
  CreateDateColumn,
  PrimaryColumn
} from "typeorm";

import { UserVerifyStatus } from "@src/constant";

import Lawyer from "./user-lawyer-meta";
import LegalAdvice from "./advice";
import Order from "./case";
import AdviceReply from "./advice-reply";
import Bidders from "./case-bidder";
import CaseAppeal from "./case-appeal";

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

  @Column({ default: null })
  phone: string;

  @Column({ default: UserVerifyStatus.init })
  verify_status: number; // 1 => 未认证， 2 => 认证中， 3 => 已认证

  @CreateDateColumn({ type: "timestamp" })
  create_time: string;

  @OneToOne(
    type => Lawyer,
    lawyer => lawyer.user,
    { cascade: true }
  )
  @JoinColumn({ name: "extra_profile_id" })
  extra_profile: Lawyer;

  @OneToMany(
    type => LegalAdvice,
    advice => advice.advicer
  )
  advices: LegalAdvice[];

  @OneToMany(
    type => Order,
    order => order.publisher
  )
  publisher: Order[];

  @OneToMany(
    type => AdviceReply,
    reply => reply.from
  )
  create_replies: AdviceReply[];

  @OneToMany(
    type => AdviceReply,
    reply => reply.to
  )
  receive_replies: AdviceReply[];

  @OneToMany(
    type => Bidders,
    bidder => bidder.lawyer
  )
  bid_info: Bidders[];

  @OneToMany(
    type => CaseAppeal,
    appeal => appeal.appealer
  )
  appealOrder: CaseAppeal[];
}
