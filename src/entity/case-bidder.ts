import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
  JoinColumn
} from "typeorm";
import Order from "./case";
import User from "./user";

@Entity()
export default class CaseBidder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: number;

  @ManyToOne(
    type => User,
    user => user.bid_info
  )
  @JoinColumn({ name: "lawyer_id" })
  lawyer: User;

  @ManyToOne(
    type => Order,
    order => order.bidders
  )
  @JoinColumn({ name: "case_id" })
  case: Order;

  @CreateDateColumn({ type: "timestamp" })
  create_time: string;
}
