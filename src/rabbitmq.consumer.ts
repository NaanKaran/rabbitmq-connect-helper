import { QueueManager } from "./rabbitmq.queuemager";

export class RabbitMQConsumer {
  constructor(
    private queueManager: QueueManager,
    private prefetchCount: number = 1
  ) {}

  async consume(
    queueName: string,
    onMessage: (message: string) => void
  ): Promise<void> {
    const channel = await this.queueManager.getOrCreateQueue(queueName);

    // Set prefetch count to control the number of unacknowledged messages per consumer
    await channel.prefetch(this.prefetchCount);

    channel.consume(
      queueName,
      (msg) => {
        if (msg) {
          try {
            onMessage(msg.content.toString());
            channel.ack(msg);
          } catch (error) {
            console.error(`Error processing message from ${queueName}:`, error);
            channel.nack(msg, false, false);
          }
        }
      },
      { noAck: false }
    );

    console.log(
      `Started consuming messages from queue: ${queueName} with prefetch count: ${this.prefetchCount}`
    );
  }
}
