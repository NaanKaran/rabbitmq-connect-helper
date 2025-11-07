import { Producer } from '../src';

async function runProducer() {
  // Create a producer with minimal configuration
  const producer = new Producer({
    url: 'amqp://localhost' // or your RabbitMQ URL
  });

  try {
    // Connect to RabbitMQ
    await producer.connect();
    console.log('Connected to RabbitMQ');

    // Send a message to a queue
    const success1 = await producer.send('my-queue', { 
      message: 'Hello RabbitMQ!', 
      timestamp: new Date().toISOString() 
    });
    
    console.log('Message sent:', success1);

    // Publish a message to an exchange
    const success2 = await producer.publish(
      'my-exchange', 
      'routing.key', 
      { 
        message: 'Publish to exchange!', 
        timestamp: new Date().toISOString() 
      }
    );
    
    console.log('Message published:', success2);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Disconnect
    await producer.disconnect();
    console.log('Disconnected from RabbitMQ');
  }
}

runProducer().catch(console.error);