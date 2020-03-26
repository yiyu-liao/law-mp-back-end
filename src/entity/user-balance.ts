import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn
} from "typeorm";
import User from "./user";

@Entity()
export default class UserLawyerMeta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "owner_id" })
  ownerId: string;

  @Column({ name: "total_balance", default: 0 })
  totalBalance: number;
}
