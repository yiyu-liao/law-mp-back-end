import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
  OneToMany
} from "typeorm";
import AdviceReply from "./advice-reply";

enum TopicEnum {
  civil_agency, // 民事代理
  commercial_dispute, // 商事纠纷
  criminal_defense, // 刑事辩护
  administrative_proceedings // 行政诉讼
}

@Entity()
export default class LegalAdvice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  c_openid: number;

  @Column()
  topic: number;

  @Column()
  content: string;

  @OneToMany(
    type => AdviceReply,
    reply => reply.advice
  )
  replies: AdviceReply[];
}
