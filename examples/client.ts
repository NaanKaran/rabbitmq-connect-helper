import * as amqp from 'amqplib';
import { RabbitMQClient } from '../src';

async function runClient() {
  // Create a client with minimal configuration
  const client = new RabbitMQClient({
    url: 'amqp://localhost' // or your RabbitMQ URL
  });

  try {
    // Connect to RabbitMQ
    await client.connect();
    console.log('Connected to RabbitMQ');

    // Send a message
    await client.send('test-queue', { 
      message: 'Hello from client!', 
      timestamp: new Date().toISOString() 
    });
    
    console.log('Message sent');

    // Start consuming messages
    await client.consume('test-queue', async (msg: amqp.ConsumeMessage) => {
      console.log('Received message:', msg.content.toString());
    });

    console.log('Started consuming... Press Ctrl+C to stop');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  process.exit(0);
});

runClient().catch(console.error);