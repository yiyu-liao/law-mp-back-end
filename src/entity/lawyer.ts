import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"; 

@Entity()
export default class Lawyear {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: null })
    balance: number;

    @Column({ default: null })
    office: string;
  
    @Column({ default: null })
    location: string;
  
    @Column({ default: null })
    experience_year: number;
  
    @Column({ default: null })
    id_photo: string;
  
    @Column({ default: null })
    license_photo: string;
  
    @Column({ default: null })
    license_no: string;
}
