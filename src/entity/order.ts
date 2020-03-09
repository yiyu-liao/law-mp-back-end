import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import Bidders from './bidders';

export enum ORDER_STATUS {
    bidding = 1,
    pending = 2,
    processing = 3,
    complete = 4,
    appeal = 5,
    cancel = 6
}

@Entity()
export default class LegalOrder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    c_openid: string;

    @Column() // 订单类型，1 => 文书起草，2 => 案件委托， 3 => 法律顾问， 4 => 案件查询
    order_type: number;

    @Column({ charset: 'utf8', type: 'varchar' })
    description: string;

    @Column()
    response_time: number;

    @Column()
    limit_time: number;

    // TO DO: add type
    @Column({ type: "simple-json", default: null })
    extra_info: any;

    @Column({ default: null })
    winner_openid: string;

    @Column({ default: ORDER_STATUS.bidding })
    status: number;

    @OneToMany(
        type => Bidders,
        bidder => bidder.order
    )
    bidders: Bidders[];
    
}