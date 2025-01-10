"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQConsumer = void 0;
class RabbitMQConsumer {
    constructor(queueManager) {
        this.queueManager = queueManager;
    }
    async consume(queueName, onMessage) {
        const channel = await this.queueManager.getOrCreateQueue(queueName);
        channel.consume(queueName, (msg) => {
            if (msg) {
                try {
                    onMessage(msg.content.toString());
                    channel.ack(msg);
                }
                catch (error) {
                    console.error(`Error processing message from ${queueName}:`, error);
                    channel.nack(msg, false, false);
                }
            }
        }, { noAck: false });
        console.log(`Started consuming messages from queue: ${queueName}`);
    }
}
exports.RabbitMQConsumer = RabbitMQConsumer;
