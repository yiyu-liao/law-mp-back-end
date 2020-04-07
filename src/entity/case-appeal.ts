import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToOne
} from "typeorm";
import Case from "./case";
import Pay from "./case-order";
import { AppealStatus } from "@src/constant";
import User from "./user";

@Entity()
export default class CaseAppeal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  out_refund_no: string;

  @Column()
  reason: string;

  @OneToOne(type => Case)
  @JoinColumn({ name: "case_id" })
  case: Case;

  @OneToOne(type => Pay)
  @JoinColumn({ name: "pay_id" })
  payOrder: Pay;

  @ManyToOne(
    type => User,
    user => user.appealOrder
  )
  @JoinColumn({ name: "appealer_id" })
  appealer: User;

  @Column({ default: AppealStatus.pending })
  status: number;

  @CreateDateColumn({ type: "timestamp" })
  createTime: string;
}
