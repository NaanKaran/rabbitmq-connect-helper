import { QueueManager } from "./rabbitmq.queuemager";

export class RabbitMQConsumer {
  constructor(
    private queueManager: QueueManager,
    private prefetchCount: number = 1
  ) {}

  async consume(
    queueName: string,
    onMessage: (msg: any, ack: () => void, nack: () => void) => Promise<void>
  ): Promise<void> {
    const channel = await this.queueManager.getOrCreateQueue(queueName);

    // Set prefetch count to control the number of unacknowledged messages per consumer
    await channel.prefetch(this.prefetchCount);

    channel.consume(
      queueName,
      async (msg) => {
        if (msg) {
          try {
            await onMessage(
              msg,
              () => channel.ack(msg), // Acknowledgement function
              () => channel.nack(msg, false, false) // Negative Acknowledgement function
            );
          } catch (error) {
            console.error(`Error processing message from ${queueName}:`, error);
            channel.nack(msg, false, false); // Reject message
          }
        }
      },
      { noAck: false } // Ensuring manual acknowledgment
    );

    console.log(
      `Started consuming messages from queue: ${queueName} with prefetch count: ${this.prefetchCount}`
    );
  }
}
