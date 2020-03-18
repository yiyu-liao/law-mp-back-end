import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn
} from "typeorm";
import Order from "./order";
import { type } from "os";
import User from "./user";

@Entity()
export default class Bidders {
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
  @JoinColumn({ name: "order_id" })
  order: Order;
}
