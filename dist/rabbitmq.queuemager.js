"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueManager = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
class QueueManager {
    constructor(url) {
        this.url = url;
        this.connections = new Map();
        if (!url)
            throw new Error("RabbitMQ URL is required.");
    }
    async getOrCreateQueue(queueName) {
        if (this.connections.has(queueName)) {
            return this.connections.get(queueName).channel;
        }
        // Create a new connection and channel for the queue
        const connection = await amqplib_1.default.connect(this.url);
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName);
        this.connections.set(queueName, { connection, channel });
        return channel;
    }
    async closeQueue(queueName) {
        const entry = this.connections.get(queueName);
        if (entry) {
            await entry.channel.close();
            await entry.connection.close();
            this.connections.delete(queueName);
        }
    }
    async closeAll() {
        for (const [queueName, { connection, channel }] of this.connections) {
            await channel.close();
            await connection.close();
        }
        this.connections.clear();
    }
}
exports.QueueManager = QueueManager;
