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

  @Column({})
  password: string;

  @Column({ default: null })
  phone: string;

  @Column({ default: null })
  email: string;

  @Column({ default: null })
  desc: string;

  @Column({ default: AdminUserStatus.enable }) // 0, 禁用； 1，启用
  conditions: number;

  @Column({ type: "simple-array" })
  roles: number[];

  @Column({ default: null, name: "last_login_time" })
  lastLoginTime: string;

  @CreateDateColumn({ type: "timestamp", name: "create_time" })
  createTime: string;
}
