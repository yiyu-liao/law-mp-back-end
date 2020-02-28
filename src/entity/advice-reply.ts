import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne
} from "typeorm";
import LegalAdvice from "./legal-advice";

@Entity()
export default class AdviceReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pid: number;

  // @Column()
  // legal_advice_id: number;

  @Column()
  content: string;

  @Column()
  from_id: string;

  @Column()
  from_name: string;

  @Column()
  to_id: string;

  @Column()
  to_name: string;

  @CreateDateColumn()
  create_time: string;

  @ManyToOne(
    type => LegalAdvice,
    legal_advice => legal_advice.replies
  )
  legal_advice: LegalAdvice;
}
