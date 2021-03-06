import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn
} from "typeorm";
import User from "./user";

@Entity()
export default class UserLawyerMeta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ charset: "utf8", default: null })
  office: string;

  @Column({ type: "simple-array", default: null })
  location: string;

  @Column({ type: "simple-array", default: null })
  expertise_area: string;

  @Column({ default: null })
  introduction: string;

  @Column({ default: null })
  office_address: string;

  @Column({ default: null })
  experience_year: number;

  @Column({ default: null })
  id_photo: string;

  @Column({ default: null })
  license_photo: string;

  @Column({ default: null })
  license_no: string;

  @OneToOne(
    type => User,
    user => user.extra_profile
  )
  user: User;
}
