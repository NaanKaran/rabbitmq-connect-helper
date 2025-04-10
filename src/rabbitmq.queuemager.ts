import amqplib, { Connection, Channel } from "amqplib";

export class QueueManager {
  private connections: Map<
    string,
    { connection: Connection; channel: Channel }
  > = new Map();
  private reconnectDelay = 30000; // in ms - 30 sec

  constructor(private url: string) {
    if (!url) throw new Error("RabbitMQ URL is required.");

    this.setupGracefulShutdown();
  }

  private async createConnection(
    queueName: string
  ): Promise<{ connection: Connection; channel: Channel }> {
    const connection = await amqplib.connect(this.url);
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName);

    connection.on("close", async () => {
      console.error(
        `Connection closed for queue: ${queueName}. Reconnecting...`
      );
      this.connections.delete(queueName);
      setTimeout(() => this.getOrCreateQueue(queueName), this.reconnectDelay);
    });

    connection.on("error", (err) => {
      console.error(`Connection error on queue: ${queueName}`, err);
    });

    return { connection, channel };
  }

  async getOrCreateQueue(queueName: string): Promise<Channel> {
    if (this.connections.has(queueName)) {
      return this.connections.get(queueName)!.channel;
    }

    const { connection, channel } = await this.createConnection(queueName);
    this.connections.set(queueName, { connection, channel });
    return channel;
  }

  async closeQueue(queueName: string): Promise<void> {
    const entry = this.connections.get(queueName);
    if (entry) {
      await entry.channel.close();
      await entry.connection.close();
      this.connections.delete(queueName);
    }
  }

  async closeAll(): Promise<void> {
    for (const [queueName, { connection, channel }] of this.connections) {
      await channel.close();
      await connection.close();
    }
    this.connections.clear();
    console.log("All RabbitMQ connections closed.");
  }

  private setupGracefulShutdown() {
    process.on("SIGINT", async () => {
      console.log("Received SIGINT. Closing RabbitMQ connections...");
      await this.closeAll();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("Received SIGTERM. Closing RabbitMQ connections...");
      await this.closeAll();
      process.exit(0);
    });
  }
}
