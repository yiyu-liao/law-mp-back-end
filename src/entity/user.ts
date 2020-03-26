import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
  PrimaryColumn
} from "typeorm";

import Lawyer from "./user-lawyer-meta";
import LegalAdvice from "./advice";
import Order from "./case";
import AdviceReply from "./advice-reply";
import Bidders from "./case-bidder";

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
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
}
