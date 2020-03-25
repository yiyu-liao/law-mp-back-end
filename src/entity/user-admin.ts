import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn
} from "typeorm";

@Entity()
export default class UserAdmin {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column()
  @Index()
  username: string;

  @Column()
  password: string;

  @Column({ type: "timestamp", default: null, name: "last_login_time" })
  lastLoginTime: string;

  @CreateDateColumn({ type: "timestamp" })
  createTime: string;
}
