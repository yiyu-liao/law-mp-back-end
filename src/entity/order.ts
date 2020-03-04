import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import Bidders from './bidders';

export enum ORDER_STATUS {
    bidding = 0,
    pending = 1,
    processing = 2,
    complete = 3,
    appeal = 4,
    cancel = 5
}

@Entity()
export default class LegalOrder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    c_openid: number;

    @Column() // 订单类型，0 => 文书起草，1 => 案件委托， 2 => 法律顾问， 3 => 案件查询
    order_type: number;

    @Column()
    description: string;

    @Column()
    response_time: number;

    @Column()
    limit_time: number;

    // TO DO: add type
    @Column({ type: "simple-json", default: null })
    extra_info: any;

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