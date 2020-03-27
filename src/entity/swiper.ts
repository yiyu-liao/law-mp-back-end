import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class swiper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: number;
}
