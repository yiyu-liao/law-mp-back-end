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

  @OneToOne(type => User)
  @JoinColumn({ name: "lawyer_info_id" })
  lawyer: User;

  @ManyToOne(
    type => Order,
    order => order.bidders
  )
  @JoinColumn({ name: "order_id" })
  order: Order;
}
