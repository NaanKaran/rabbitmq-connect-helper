import { QueueManager } from "./rabbitmq.queuemager";
export declare class RabbitMQConsumer {
    private queueManager;
    constructor(queueManager: QueueManager);
    consume(queueName: string, onMessage: (message: string) => void): Promise<void>;
}
//# sourceMappingURL=rabbitmq.consumer.d.ts.map