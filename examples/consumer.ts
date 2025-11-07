import * as amqp from 'amqplib';
import { Consumer } from '../src';

async function runConsumer() {
  // Create a consumer with minimal configuration
  const consumer = new Consumer({
    url: 'amqp://localhost', // or your RabbitMQ URL
    queue: 'my-queue',       // default queue to consume from
    prefetch: 5             // process up to 5 messages at a time
  });

  try {
    // Connect to RabbitMQ
    await consumer.connect();
    console.log('Connected to RabbitMQ and ready to consume');

    // Start consuming messages
    const consumerTag = await consumer.consume('my-queue', (msg: amqp.ConsumeMessage) => {
      // Process the message
      const content = JSON.parse(msg.content.toString());
      console.log('Received message:', content);
      
      // The message is automatically acknowledged after successful processing
      // For manual acknowledgment, we handle it in the Consumer class
    });

    console.log('Started consuming with tag:', consumerTag);
    
    // Keep the process running
    console.log('Consumer is running... Press Ctrl+C to stop');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

runConsumer().catch(console.error);