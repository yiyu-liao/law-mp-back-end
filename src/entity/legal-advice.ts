import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  OneToMany
} from "typeorm";
import AdviceReply from "./advice-reply";

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

  @Column()
  c_openid: string;

  // @Column({ type: 'simple-array' })
  // l_openids: string[] | number[];

  @Column()
  topic: number;

  @Column({ charset: 'utf8', type: 'varchar' })
  content: string;

  @Column({ default: ADVICE_STATUS.answering })
  status: number;

  @CreateDateColumn({ type: 'timestamp' } )
  create_time: string;

  @OneToMany(
    type => AdviceReply,
    reply => reply.advice
  )
  replies: AdviceReply[];
}
