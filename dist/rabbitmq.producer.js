"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQProducer = void 0;
class RabbitMQProducer {
    constructor(queueManager) {
        this.queueManager = queueManager;
    }
    async send(queueName, message) {
        const channel = await this.queueManager.getOrCreateQueue(queueName);
        const buffer = Buffer.from(message);
        let response = channel.sendToQueue(queueName, buffer);
        return response;
    }
}
exports.RabbitMQProducer = RabbitMQProducer;
