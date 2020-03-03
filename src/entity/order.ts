import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import Bidders from './bidders';

export enum ORDER_STATUS {
    bidding = 0,
    pending = 1,
    processing = 2,
    complete = 3,
    appeal = 4
}

@Entity()
export default class LegalOrder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    c_openid: number;

    @Column()
    description: string;

    @Column()
    response_time: number;

    @Column()
    limit_time: number;

    @Column({ default: null })
    winner_openid: number;

    @Column({ default: ORDER_STATUS.bidding })
    status: number;

    @OneToMany(
        type => Bidders,
        bidder => bidder.order
    )
    bidders: Bidders[];
    
}