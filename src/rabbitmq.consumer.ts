import { QueueManager } from "./rabbitmq.queuemager";

export class RabbitMQConsumer {
  constructor(private queueManager: QueueManager) {}

  async consume(
    queueName: string,
    onMessage: (message: string) => void
  ): Promise<void> {
    const channel = await this.queueManager.getOrCreateQueue(queueName);

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

    console.log(`Started consuming messages from queue: ${queueName}`);
  }
}
