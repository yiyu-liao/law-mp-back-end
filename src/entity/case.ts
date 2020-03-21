import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  OneToMany
} from "typeorm";

import Bidders from "./case-bidder";
import User from "./user";
import { CaseStatus } from "@src/constant";

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

  @Column()
  select_lawyer_id: string;

  @Column() // 案件类型，1 => 文书起草，2 => 案件委托， 3 => 法律顾问， 4 => 案件查询
  case_type: number;

  // TO DO: add type
  @Column({ type: "simple-json", default: null })
  extra_info: any;

  @Column({ default: null })
  server_id: string;

  @Column({ default: CaseStatus.bidding })
  status: number;

  @OneToMany(
    type => Bidders,
    bidder => bidder.case
  )
  bidders: Bidders[];

  @CreateDateColumn({ type: "timestamp" })
  create_time: string;
}
