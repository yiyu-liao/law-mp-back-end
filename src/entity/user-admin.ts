import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn
} from "typeorm";

@Entity()
export default class UserAdmin {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @Index()
  username: string;

  @Column()
  password: string;

  @Column({ type: "timestamp", default: null, name: "last_login_time" })
  lastLoginTime: string;

  @CreateDateColumn({ type: "timestamp", name: "create_time" })
  createTime: string;
}
