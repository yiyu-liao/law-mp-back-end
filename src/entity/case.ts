import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne
} from "typeorm";

import Bidders from "./case-bidder";
import User from "./user";
import { CaseStatus } from "@src/constant";
import CasePayOrder from "./case-order";
import CaseAppeal from "./case-appeal";

// export interface IExtraInfo {
//   description?: string;

//   response_time?: number;

//   limit_time?: number;
// }

@Entity()
export default class Case {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => User,
    user => user.advices
  )
  @JoinColumn({ name: "publisher_id" })
  publisher: User;

  @Column() // 案件类型，1 => 文书起草，2 => 案件委托， 3 => 法律顾问， 4 => 案件查询
  case_type: number;

  @Column({ type: "simple-json", default: null })
  extra_info: any;

  @Column({ default: CaseStatus.bidding })
  status: number;

  @Column({ default: null })
  pre_appeal_status: number;

  @Column({ default: null })
  auto_confirm_time: string;

  @OneToMany(
    type => Bidders,
    bidder => bidder.case
  )
  bidders: Bidders[];

  @OneToMany(
    type => CasePayOrder,
    payOrder => payOrder.case
  )
  payOrder: CasePayOrder[];

  @ManyToOne(
    type => User,
    user => user.selected_lawyer_case
  )
  @JoinColumn({ name: "select_lawyer_id" })
  selectLawyer: User;

  @OneToOne(
    type => CaseAppeal,
    appeal => appeal.case
  )
  appeal: CaseAppeal;

  @CreateDateColumn({ type: "timestamp" })
  create_time: string;
}
