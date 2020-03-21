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
import { PayOrderStatus } from "@src/constant";

@Entity()
export default class CasePayOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  out_trade_no: string;

  @OneToOne(type => Case)
  @JoinColumn({ name: "case_id" })
  case: Case;

  @Column()
  total_fee: number;

  @Column({ default: PayOrderStatus.prePay })
  pay_status: number;
}
