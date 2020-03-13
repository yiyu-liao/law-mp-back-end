import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
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

  // @Column()
  // legal_advice_id: number;

  @Column({ charset: "utf8", type: "varchar" })
  content: string;

  @OneToOne(type => User)
  @JoinColumn({ name: "from_id" })
  from: User;

  @OneToOne(type => User)
  @JoinColumn({ name: "to_id" })
  to: User;

  @CreateDateColumn({ type: "timestamp" })
  create_time: string;

  @ManyToOne(
    type => LegalAdvice,
    adivice => adivice.replies
  )
  @JoinColumn({ name: "advice_id" })
  advice: LegalAdvice;
}
