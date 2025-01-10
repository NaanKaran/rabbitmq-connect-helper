import { QueueManager } from "./rabbitmq.queuemager";
export declare class RabbitMQProducer {
    private queueManager;
    constructor(queueManager: QueueManager);
    send(queueName: string, message: string): Promise<boolean>;
}
//# sourceMappingURL=rabbitmq.producer.d.ts.map