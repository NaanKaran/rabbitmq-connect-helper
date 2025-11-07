import * as amqp from 'amqplib';
import { RabbitMQClient, QueueOptions } from './rabbitmq-client';

export interface ConsumerConfig {
  url: string; // Made required
  queue?: string;
  autoAck?: boolean;
  prefetch?: number;
}

/**
 * Simplified Consumer class for RabbitMQ
 * Provides easy message consumption with minimal configuration
 */
export class Consumer {
  private client: RabbitMQClient;
  private defaultQueue?: string;
  private autoAck: boolean;
  private prefetch: number;

  constructor(config: ConsumerConfig) {
    this.client = new RabbitMQClient({
      url: config.url,
      reconnectDelay: 5000,
      maxRetries: 5
    });
    
    this.defaultQueue = config.queue;
    this.autoAck = config.autoAck ?? false; // Default to manual ack for safety
    this.prefetch = config.prefetch ?? 10;
  }

  /**
   * Connect to RabbitMQ
   */
  async connect(): Promise<void> {
    await this.client.connect();
    
    // Set prefetch if channel is available
    if (this.client.getChannel()) {
      await this.client.getChannel()!.prefetch(this.prefetch);
    }
  }

  /**
   * Start consuming messages from a queue
   */
  async consume(
    queue: string, 
    onMessage: (msg: amqp.ConsumeMessage) => Promise<void> | void,
    options?: QueueOptions
  ): Promise<string> {
    const actualQueue = queue || this.defaultQueue;
    if (!actualQueue) {
      throw new Error('Queue name is required');
    }
    
    // Wrap the user's message handler to handle autoAck if needed
    const messageHandler = async (msg: amqp.ConsumeMessage) => {
      try {
        await Promise.resolve(onMessage(msg));
        
        // Acknowledge message if not auto-ack
        if (!this.autoAck && this.client.getChannel()) {
          this.client.getChannel()!.ack(msg);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        
        // Reject message if not auto-ack
        if (!this.autoAck && this.client.getChannel()) {
          this.client.getChannel()!.nack(msg, false, true); // Requeue on error
        }
      }
    };
    
    return await this.client.consume(actualQueue, messageHandler, options);
  }

  /**
   * Stop consuming from a queue using consumer tag
   */
  async stopConsuming(consumerTag: string): Promise<void> {
    await this.client.stopConsuming(consumerTag);
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