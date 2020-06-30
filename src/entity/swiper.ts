import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class swiper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: null })
  uid: string;

  @Column({ default: null })
  url: string;
}
