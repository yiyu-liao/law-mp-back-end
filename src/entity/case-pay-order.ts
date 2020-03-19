import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from "typeorm";

@Entity()
export default class CasePayOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  order_no: string;

  @Column()
  @Column()
  pay_number: number;

  @Column()
  is_pay: number;
}
