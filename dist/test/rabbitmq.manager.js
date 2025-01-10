"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.producer = exports.consumer = exports.queueManager = void 0;
const rabbitmq_queuemager_1 = require("../rabbitmq.queuemager");
const rabbitmq_consumer_1 = require("../rabbitmq.consumer");
const rabbitmq_producer_1 = require("../rabbitmq.producer");
// Configuration
const rabbitMqConfig = {
    url: "amqp://localhost",
};
const queueManager = new rabbitmq_queuemager_1.QueueManager(rabbitMqConfig.url);
exports.queueManager = queueManager;
const consumer = new rabbitmq_consumer_1.RabbitMQConsumer(queueManager);
exports.consumer = consumer;
const producer = new rabbitmq_producer_1.RabbitMQProducer(queueManager);
exports.producer = producer;
