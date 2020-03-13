import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  OneToMany,
  ManyToOne
} from "typeorm";
import AdviceReply from "./advice-reply";
import User from "./user";
import { type } from "os";

enum TopicEnum {
  civil_agency, // 民事代理
  commercial_dispute, // 商事纠纷
  criminal_defense, // 刑事辩护
  administrative_proceedings // 行政诉讼
}

export enum ADVICE_STATUS {
  answering = 1,
  over = 2
}

@Entity()
export default class LegalAdvice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ charset: "utf8", type: "varchar" })
  title: string;

  @Column()
  topic: number;

  @Column({ charset: "utf8", type: "varchar" })
  content: string;

  @Column({ default: ADVICE_STATUS.answering })
  status: number;

  @ManyToOne(
    type => User,
    user => user.advices
  )
  @JoinColumn({ name: "advicer_id" })
  advicer: User;

  @OneToMany(
    type => AdviceReply,
    reply => reply.advice
  )
  replies: AdviceReply[];

  @CreateDateColumn({ type: "timestamp" })
  create_time: string;
}
