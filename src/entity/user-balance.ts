import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class UserBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "owner_id" })
  ownerId: number;

  @Column({ name: "total_balance", default: 0 })
  totalBalance: number;
}
