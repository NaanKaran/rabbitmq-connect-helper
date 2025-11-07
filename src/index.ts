// Simplified RabbitMQ Helper - Main Export File
// Provides a minimal, easy-to-use API for RabbitMQ integration

export { RabbitMQClient } from './rabbitmq-client';
export { Producer } from './producer';
export { Consumer } from './consumer';

// Type exports
export type { RabbitMQConfig, QueueOptions, ExchangeOptions, PublishOptions } from './rabbitmq-client';
export type { ProducerConfig } from './producer';
export type { ConsumerConfig } from './consumer';