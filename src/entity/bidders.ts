import {  Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import Order from './order';

@Entity()
export default class Bidders {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    price: number;

    @Column()
    l_opendid: number;

    @ManyToOne(
        type => Order,
        order => order.bidders
    )
    order: Order

}