import * as amqp from 'amqplib';
import { EventEmitter } from 'events';

export interface RabbitMQConfig {
  url: string;
  connectionOptions?: amqp.Options.Connect;
  reconnectDelay?: number;
  maxRetries?: number;
  heartbeat?: number;
}

export interface QueueOptions {
  durable?: boolean;
  autoDelete?: boolean;
  exclusive?: boolean;
}

export interface ExchangeOptions {
  type?: 'direct' | 'topic' | 'headers' | 'fanout';
  durable?: boolean;
  autoDelete?: boolean;
  internal?: boolean;
}

export interface PublishOptions {
  persistent?: boolean;
  contentType?: string;
  headers?: Record<string, any>;
  messageId?: string;
  timestamp?: number;
  expiration?: string;
  routingKey?: string;
  type?: 'direct' | 'topic' | 'headers' | 'fanout';
}

/**
 * RabbitMQ Client - Simplified RabbitMQ client with minimal setup
 */
export class RabbitMQClient extends EventEmitter {
  private connection: amqp.Connection | null = null;
  private channelModel: amqp.ChannelModel | null = null;
  private channel: amqp.ConfirmChannel | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(private config: RabbitMQConfig) {
    super();
    this.setMaxListeners(0); // Remove listener limit
  }

  /**
   * Connect to RabbitMQ server
   */
  async connect(): Promise<void> {
    try {
      // amqp.connect() returns a ChannelModel, which contains the connection
      this.channelModel = await amqp.connect(this.config.url, this.config.connectionOptions);
      
      // Access the actual connection
      this.connection = this.channelModel.connection;
      
      this.connection.on('error', (err) => {
        this.handleError('Connection error', err);
        this.handleReconnect();
      });

      this.connection.on('close', () => {
        this.isConnected = false;
        this.emit('close');
        this.handleReconnect();
      });

      this.channel = await this.channelModel.createConfirmChannel();
      
      this.channel.on('error', (err) => {
        this.handleError('Channel error', err);
      });

      this.channel.on('close', () => {
        this.emit('channelClose');
        if (this.isConnected) {
          this.handleReconnect();
        }
      });

      // Set default prefetch
      if (this.channel) {
        await this.channel.prefetch(10);
      }
      
      this.isConnected = true;
      this.emit('connect');
      
    } catch (error) {
      this.handleError('Failed to connect', error);
      throw error;
    }
  }

  /**
   * Disconnect from RabbitMQ
   */
  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }

    if (this.channelModel) {
      await this.channelModel.close();
      this.channelModel = null;
    }

    this.isConnected = false;
  }

  /**
   * Send a message to a queue
   */
  async send(queue: string, message: any, options?: PublishOptions): Promise<boolean> {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }

    // Ensure queue exists
    await this.channel.assertQueue(queue, { durable: true });

    const content = typeof message === 'string' ? message : JSON.stringify(message);
    const msgOptions = {
      persistent: options?.persistent ?? true,
      contentType: options?.contentType ?? 'application/json',
      messageId: options?.messageId || this.generateId(),
      timestamp: options?.timestamp || Date.now(),
      headers: options?.headers || {},
    };

    return new Promise((resolve, reject) => {
      this.channel!.sendToQueue(queue, Buffer.from(content), msgOptions, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Publish a message to an exchange
   */
  async publish(exchange: string, routingKey: string, message: any, options?: PublishOptions): Promise<boolean> {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }

    // Ensure exchange exists
    await this.channel.assertExchange(exchange, options?.type || 'direct', { durable: true });

    const content = typeof message === 'string' ? message : JSON.stringify(message);
    const msgOptions = {
      persistent: options?.persistent ?? true,
      contentType: options?.contentType ?? 'application/json',
      messageId: options?.messageId || this.generateId(),
      timestamp: options?.timestamp || Date.now(),
      headers: options?.headers || {},
    };

    return new Promise((resolve, reject) => {
      this.channel!.publish(exchange, routingKey, Buffer.from(content), msgOptions, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Consume messages from a queue
   */
  async consume(queue: string, onMessage: (msg: amqp.ConsumeMessage) => Promise<void>, options?: QueueOptions): Promise<string> {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }

    // Ensure queue exists
    await this.channel.assertQueue(queue, { 
      durable: options?.durable ?? true,
      autoDelete: options?.autoDelete ?? false,
      exclusive: options?.exclusive ?? false
    });

    const consumer = await this.channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          await onMessage(msg);
          this.channel!.ack(msg);
        } catch (error) {
          this.handleError('Error processing message', error);
          this.channel!.nack(msg, false, true); // Requeue on error
        }
      }
    });

    return consumer.consumerTag;
  }

  /**
   * Stop consuming from a queue
   */
  async stopConsuming(consumerTag: string): Promise<void> {
    if (this.channel) {
      await this.channel.cancel(consumerTag);
    }
  }

  /**
   * Assert a queue exists
   */
  async assertQueue(queue: string, options?: QueueOptions): Promise<void> {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }

    await this.channel.assertQueue(queue, {
      durable: options?.durable ?? true,
      autoDelete: options?.autoDelete ?? false,
      exclusive: options?.exclusive ?? false
    });
  }

  /**
   * Assert an exchange exists
   */
  async assertExchange(exchange: string, options?: ExchangeOptions): Promise<void> {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }

    await this.channel.assertExchange(exchange, options?.type || 'direct', {
      durable: options?.durable ?? true,
      autoDelete: options?.autoDelete ?? false,
      internal: options?.internal ?? false
    });
  }

  /**
   * Check connection status
   */
  isConnectedStatus(): boolean {
    return this.isConnected && !!this.connection && !!this.channel;
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle reconnection
   */
  private handleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts < (this.config.maxRetries ?? 5)) {
      this.reconnectAttempts++;
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(err => {
          this.handleError('Reconnection failed', err);
          this.handleReconnect(); // Try again
        });
      }, this.config.reconnectDelay ?? 5000);
    } else {
      this.emit('reconnectFailed');
    }
  }

  /**
   * Handle errors
   */
  private handleError(message: string, error: any): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.emit('error', new Error(`${message}: ${err.message}`));
  }

  /**
   * Get the underlying channel (for advanced use cases)
   */
  getChannel(): amqp.ConfirmChannel | null {
    return this.channel;
  }

  /**
   * Get the underlying connection (for advanced use cases)
   */
  getConnection(): amqp.Connection | null {
    return this.connection;
  }
}