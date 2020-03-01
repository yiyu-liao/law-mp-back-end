import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
  OneToMany
} from "typeorm";
import AdviceReply from "./advice-reply";

@Entity()
export default class LegalAdvice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  c_openid: number;

  @Column()
  topic: string;

  @Column()
  content: string;

  @OneToMany(
    type => AdviceReply,
    reply => reply.advice
  )
  replies: AdviceReply[];
}
