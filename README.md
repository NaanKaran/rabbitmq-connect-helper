# Simple RabbitMQ Client

A simple, modern RabbitMQ client for Node.js with minimal setup and easy-to-use API.

## Features

- **Minimal Setup**: Connect to RabbitMQ with just a URL
- **Simple API**: Easy-to-use Producer and Consumer classes
- **TypeScript Support**: Full TypeScript definitions included
- **Modern JavaScript**: ES6+ compatible with async/await
- **Reliable**: Automatic reconnection and error handling

## Installation

```bash
npm install simple-rabbitmq-client
```

## Quick Start

### Producer (Sending Messages)

```typescript
import { Producer } from 'simple-rabbitmq-client';

async function sendMessage() {
  const producer = new Producer({
    url: 'amqp://localhost' // or your RabbitMQ URL
  });

  try {
    await producer.connect();
    
    // Send to a queue
    await producer.send('my-queue', { 
      message: 'Hello RabbitMQ!', 
      timestamp: new Date().toISOString() 
    });
    
    // Publish to an exchange
    await producer.publish(
      'my-exchange', 
      'routing.key', 
      { message: 'Publish to exchange!' }
    );
    
  } finally {
    await producer.disconnect();
  }
}
```

### Consumer (Receiving Messages)

```typescript
import * as amqp from 'amqplib';
import { Consumer } from 'simple-rabbitmq-client';

async function startConsumer() {
  const consumer = new Consumer({
    url: 'amqp://localhost',
    queue: 'my-queue'
  });

  await consumer.connect();
  
  // Start consuming messages
  await consumer.consume('my-queue', (msg: amqp.ConsumeMessage) => {
    console.log('Received message:', JSON.parse(msg.content.toString()));
  });
}
```

### Direct Client Usage

```typescript
import { RabbitMQClient } from 'simple-rabbitmq-client';

async function runClient() {
  const client = new RabbitMQClient({
    url: 'amqp://localhost' // or your RabbitMQ URL
  });

  try {
    await client.connect();

    // Send a message
    await client.send('test-queue', { 
      message: 'Hello from client!', 
      timestamp: new Date().toISOString() 
    });
    
    // Start consuming messages
    await client.consume('test-queue', (msg: amqp.ConsumeMessage) => {
      console.log('Received message:', msg.content.toString());
    });
    
    // Keep the process running
    console.log('Client running... Press Ctrl+C to stop');
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## API

### Producer

```typescript
new Producer(config: ProducerConfig)
```

- `url`: RabbitMQ connection URL (required)
- `queue`: Default queue name
- `exchange`: Default exchange name
- `routingKey`: Default routing key

**Methods:**
- `connect()`: Connect to RabbitMQ
- `send(queue, message, options?)`: Send message to queue
- `publish(exchange, routingKey, message, options?)`: Publish to exchange
- `disconnect()`: Disconnect from RabbitMQ
- `isConnected()`: Check connection status

### Consumer

```typescript
new Consumer(config: ConsumerConfig)
```

- `url`: RabbitMQ connection URL (required)
- `queue`: Default queue name
- `autoAck`: Auto-acknowledge messages (default: false)
- `prefetch`: Number of messages to prefetch (default: 10)

**Methods:**
- `connect()`: Connect to RabbitMQ
- `consume(queue, handler, options?)`: Start consuming messages
- `stopConsuming(consumerTag)`: Stop consuming with consumer tag
- `disconnect()`: Disconnect from RabbitMQ
- `isConnected()`: Check connection status

### RabbitMQClient

The base client class for advanced usage with direct access to channels and connections.

## Examples

Run the examples:

```bash
# Producer example
npm run example:producer

# Consumer example  
npm run example:consumer

# Client example
npm run example:client
```

## Configuration

All classes accept connection configuration options:

```typescript
{
  url: string,                    // RabbitMQ connection URL (required)
  connectionOptions?: {           // Additional connection options
    heartbeat?: number,
    // ... other amqplib options
  },
  reconnectDelay?: number,        // Reconnection delay in ms (default: 5000)
  maxRetries?: number             // Max reconnection attempts (default: 5)
}
```

## License

MIT