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

  @ManyToOne(
    type => Case,
    targetCase => targetCase.payOrder
  )
  @JoinColumn({ name: "case_id" })
  case: Case;

  @Column()
  total_fee: number;

  @Column({ default: PayOrderStatus.prepay })
  pay_status: number;
}
