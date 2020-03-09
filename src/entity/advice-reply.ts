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

  @Column({ default: 0 })
  pid: number;

  // @Column()
  // legal_advice_id: number;

  @Column({ charset: 'utf8', type: 'varchar' })
  content: string;

  @Column()
  from_openid: string;

  @Column({ charset: 'utf8' })
  from_name: string;

  @Column()
  to_openid: string;

  @Column({ charset: 'utf8' })
  to_name: string;

  @CreateDateColumn({ type: 'timestamp' })
  create_time: string;

  @ManyToOne(
    type => LegalAdvice,
    adivice => adivice.replies
  )
  advice: LegalAdvice;
}
