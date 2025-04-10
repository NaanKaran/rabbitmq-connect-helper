import { QueueManager } from "../rabbitmq.queuemager";
import { RabbitMQConsumer } from "../rabbitmq.consumer";
import { RabbitMQProducer } from "../rabbitmq.producer";
import mockAmqplib from "amqplib";

const username = "admin";
const password = encodeURIComponent("StrongPassword123");
const host = "localhost"; // Or your RabbitMQ server address

const rabbitMqUrl = `amqp://${username}:${password}@${host}`;
jest.setTimeout(20000);
describe("QueueManager", () => {
  let queueManager: QueueManager;
  let consumer: RabbitMQConsumer;
  let producer: RabbitMQProducer;

  beforeEach(() => {
    queueManager = new QueueManager(rabbitMqUrl);
    consumer = new RabbitMQConsumer(queueManager);
    producer = new RabbitMQProducer(queueManager);
  });

  afterEach(async () => {
    await queueManager.closeAll();
  });

  it("should create a connection and channel for a new queue and produce message", async () => {
    const queueName = "testQueue";
    const message = "test message";
    let result = await producer.send(queueName, message);
    expect(result).toBeTruthy();
  });

  it("should create a connection and channel for a new queue and consume message", async () => {
    const queueName = "testQueue";
    const message = "test message";

    // Send a message to the queue
    const result = await producer.send(queueName, message);
    expect(result).toBeTruthy();

    // Wait for the message to be consumed
    const consumedMessage = await new Promise<string>((resolve) => {
      consumer.consume(queueName, async (msg, ack, nack) => {
        resolve(msg);
      });
    });

    console.log(consumedMessage); // Log the consumed message
    expect(consumedMessage).toBe(message); // Assert the consumed message matches
  });
});
