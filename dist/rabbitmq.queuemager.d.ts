import { Channel } from "amqplib";
export declare class QueueManager {
    private url;
    private connections;
    constructor(url: string);
    getOrCreateQueue(queueName: string): Promise<Channel>;
    closeQueue(queueName: string): Promise<void>;
    closeAll(): Promise<void>;
}
//# sourceMappingURL=rabbitmq.queuemager.d.ts.map