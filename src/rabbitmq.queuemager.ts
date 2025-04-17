import amqplib, { Connection, Channel } from "amqplib";

export class QueueManager {
  private connections: Map<
    string,
    { connection: Connection; channel: Channel }
  > = new Map();
  private reconnecting: Set<string> = new Set();
  private reconnectDelay = 10000; // 10 seconds

  constructor(private url: string) {
    if (!url) throw new Error("RabbitMQ URL is required.");
    this.setupGracefulShutdown();
  }

  private async createConnection(
    queueName: string
  ): Promise<{ connection: Connection; channel: Channel }> {
    const connection = await amqplib.connect(this.url);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });

    // Listen for connection close
    connection.on("close", () => {
      console.error(`🔌 Connection closed for queue: ${queueName}`);
      this.handleReconnect(queueName);
    });

    connection.on("error", (err) => {
      console.error(`❌ Connection error on queue: ${queueName}`, err);
    });

    // Listen for channel close
    channel.on("close", () => {
      console.warn(`📴 Channel closed for queue: ${queueName}`);
      this.handleReconnect(queueName);
    });

    channel.on("error", (err) => {
      console.warn(`⚠️ Channel error for queue: ${queueName}`, err);
    });

    return { connection, channel };
  }

  private handleReconnect(queueName: string): void {
    if (this.reconnecting.has(queueName)) return;

    this.reconnecting.add(queueName);
    this.connections.delete(queueName);

    setTimeout(async () => {
      try {
        console.log(`🔄 Reconnecting to queue: ${queueName}...`);
        const { connection, channel } = await this.createConnection(queueName);
        this.connections.set(queueName, { connection, channel });
        console.log(`✅ Reconnected to queue: ${queueName}`);
      } catch (err) {
        console.error(`❌ Failed to reconnect to queue: ${queueName}`, err);
      } finally {
        this.reconnecting.delete(queueName);
      }
    }, this.reconnectDelay);
  }

  async getOrCreateQueue(queueName: string): Promise<Channel> {
    const existing = this.connections.get(queueName);

    if (existing) {
      // Validate the channel is still open
      try {
        await existing.channel.checkQueue(queueName);
        return existing.channel;
      } catch (err) {
        console.warn(`⚠️ Channel stale for ${queueName}, reconnecting...`);
        this.handleReconnect(queueName);
        await this.delay(this.reconnectDelay);
      }
    }

    const { connection, channel } = await this.createConnection(queueName);
    this.connections.set(queueName, { connection, channel });
    return channel;
  }

  async closeQueue(queueName: string): Promise<void> {
    const entry = this.connections.get(queueName);
    if (entry) {
      try {
        await entry.channel.close();
        await entry.connection.close();
      } catch (err) {
        console.error(`❌ Error closing queue: ${queueName}`, err);
      } finally {
        this.connections.delete(queueName);
      }
    }
  }

  async closeAll(): Promise<void> {
    for (const [queueName, { connection, channel }] of this.connections) {
      try {
        await channel.close();
        await connection.close();
      } catch (err) {
        console.error(`❌ Error closing queue: ${queueName}`, err);
      }
    }
    this.connections.clear();
    console.log("✅ All RabbitMQ connections closed.");
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`⚠️ Received ${signal}. Closing RabbitMQ connections...`);
      await this.closeAll();
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
