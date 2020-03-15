import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import LegalAdvice from "./legal-advice";
import User from "./user";

@Entity()
export default class AdviceReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  pid: number;

  @Column({ charset: "utf8", type: "varchar" })
  content: string;

  @CreateDateColumn({ type: "timestamp" })
  create_time: string;

  @ManyToOne(
    type => User,
    user => user.create_replies
  )
  @JoinColumn({ name: "from_id" })
  from: User;

  @ManyToOne(
    type => User,
    user => user.receive_replies
  )
  @JoinColumn({ name: "to_id" })
  to: User;

  @ManyToOne(
    type => LegalAdvice,
    adivice => adivice.replies
  )
  @JoinColumn({ name: "advice_id" })
  advice: LegalAdvice;
}
