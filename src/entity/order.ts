import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  OneToMany
} from "typeorm";

import Bidders from "./bidders";
import User from "./user";

export enum ORDER_STATUS {
  bidding = 1,
  pending = 2,
  processing = 3,
  complete = 4,
  appeal = 5,
  cancel = 6
}

export interface IExtraInfo {
  description?: string;

  response_time?: number;

  limit_time?: number;
}

@Entity()
export default class LegalOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => User,
    user => user.advices
  )
  @JoinColumn({ name: "publisher_id" })
  publisher: User;

  @Column() // 订单类型，1 => 文书起草，2 => 案件委托， 3 => 法律顾问， 4 => 案件查询
  order_type: number;

  // TO DO: add type
  @Column({ type: "simple-json", default: null })
  extra_info: IExtraInfo;

  @Column({ default: null })
  server_openid: string;

  @Column({ default: ORDER_STATUS.bidding })
  status: number;

  @OneToMany(
    type => Bidders,
    bidder => bidder.order
  )
  bidders: Bidders[];
}
