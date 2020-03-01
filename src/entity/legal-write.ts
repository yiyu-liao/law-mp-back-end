import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class LegalWrite {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    c_openid: number;

    @Column()
    descrition: string;

    @Column()
    response_time: number;

    @Column()
    limit_time: number;

    
    
}