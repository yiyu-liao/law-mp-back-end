import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn
} from "typeorm";
import { AdminUserStatus } from "@src/constant/index";

@Entity()
export default class UserAdmin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  username: string;

  @Column()
  nickname: string;

  @Column({ default: AdminUserStatus.enable }) // 0, 禁用； 1，启用
  status: number;

  @Column({})
  password: string;

  @Column({ default: null, name: "last_login_time" })
  lastLoginTime: string;

  @CreateDateColumn({ type: "timestamp", name: "create_time" })
  createTime: string;
}
