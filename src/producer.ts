import { RabbitMQClient, PublishOptions } from './rabbitmq-client';

export interface ProducerConfig {
  url: string; // Made required
  queue?: string;
  exchange?: string;
  routingKey?: string;
}

/**
 * Simplified Producer class for RabbitMQ
 * Provides easy message publishing with minimal configuration
 */
export class Producer {
  private client: RabbitMQClient;
  private defaultQueue?: string;
  private defaultExchange?: string;
  private defaultRoutingKey?: string;

  constructor(config: ProducerConfig) {
    this.client = new RabbitMQClient({
      url: config.url,
      reconnectDelay: 5000,
      maxRetries: 5
    });
    
    this.defaultQueue = config.queue;
    this.defaultExchange = config.exchange;
    this.defaultRoutingKey = config.routingKey;
  }

  /**
   * Connect to RabbitMQ
   */
  async connect(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Send a message to a queue
   */
  async send(queue: string, message: any, options?: Omit<PublishOptions, 'routingKey'>): Promise<boolean> {
    const actualQueue = queue || this.defaultQueue;
    if (!actualQueue) {
      throw new Error('Queue name is required');
    }
    
    return await this.client.send(actualQueue, message, options);
  }

  /**
   * Publish a message to an exchange
   */
  async publish(exchange: string, routingKey: string, message: any, options?: PublishOptions): Promise<boolean> {
    const actualExchange = exchange || this.defaultExchange;
    if (!actualExchange) {
      throw new Error('Exchange name is required');
    }
    
    return await this.client.publish(
      actualExchange,
      routingKey || this.defaultRoutingKey || '',
      message,
      options
    );
  }

  /**
   * Disconnect from RabbitMQ
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.client.isConnectedStatus();
  }

  /**
   * Get the underlying client (for advanced use cases)
   */
  getClient(): RabbitMQClient {
    return this.client;
  }
}