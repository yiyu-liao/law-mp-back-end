
import { Entity, PrimaryGeneratedColumn, Column, IsNull } from "typeorm"; 

@Entity()
export default class WxFormId {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    openid: string;

    @Column()
    form_id: string;

    @Column({ type: 'bigint' })
    expire: number;
}