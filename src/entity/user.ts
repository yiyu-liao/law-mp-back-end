import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"; 

export interface ILawyerVerifyInfo {
  real_name: string;

  office: string;

  location: string;

  experience_year: number;

  id_photo: string;

  license_photo: string;

  license_no: string;
}

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  openid: string;

  @Column()
  avatar: string;

  @Column()
  nick_name: string;

  @Column()
  role: number; // 0 => customer, 1 => lawyer

  @Column({ default: null })
  verify_status: number; // 0 => 未认证， 1 => 认证中， 2 => 已认证

  @Column({ type: 'simple-json', default: null })
  extra_info: ILawyerVerifyInfo;
}
