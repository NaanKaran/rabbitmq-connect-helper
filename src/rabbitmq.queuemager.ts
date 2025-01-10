import amqplib, { Connection, Channel } from "amqplib";

export class QueueManager {
  private connections: Map<
    string,
    { connection: Connection; channel: Channel }
  > = new Map();

  constructor(private url: string) {
    if (!url) throw new Error("RabbitMQ URL is required.");
  }

  async getOrCreateQueue(queueName: string): Promise<Channel> {
    if (this.connections.has(queueName)) {
      return this.connections.get(queueName)!.channel;
    }

    // Create a new connection and channel for the queue
    const connection = await amqplib.connect(this.url);
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName);

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
  }
}
