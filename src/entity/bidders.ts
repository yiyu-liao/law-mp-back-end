import {  Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import Order from './order';

@Entity()
export default class Bidders {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    price: number;

    // To Review，是否考虑设计成联表查询，拿出userInfo
    @Column()
    l_openid: number;

    @ManyToOne(
        type => Order,
        order => order.bidders
    )
    order: Order

}