# **RabbitMQ Connect Helper**
A lightweight TypeScript library for managing RabbitMQ connections, queues, producers, and consumers. This package simplifies RabbitMQ integration in your Node.js applications by providing reusable helpers.

---

## **Features**

- Manage RabbitMQ connections and channels seamlessly.
- Support for multiple queues with dynamic queue creation.
- Easy-to-use producers and consumers for publishing and receiving messages.
- Built with TypeScript for type safety and better developer experience.

---

## **Installation**

Install the package via NPM:

```bash
npm install rabbitmq-connect-helper
```

## **Usage**

### Setup

Import the classes in your application:

```typescript
import { QueueManager, RabbitMQProducer, RabbitMQConsumer } from "rabbitmq-connect-helper";
```

Configure the QueueManager with your RabbitMQ connection URL:

```typescript
const rabbitMqUrl = "amqp://<username>:<password>@<host>";
const queueManager = new QueueManager(rabbitMqUrl);
```

### Producer Example

Send messages to a queue:

```typescript
const producer = new RabbitMQProducer(queueManager);


    const queueName = "exampleQueue";
    const message = { content: "Hello, RabbitMQ!" };
    
    await producer.send(queueName, message);
    console.log("Message sent!");

```

### Consumer Example

Consume messages from a queue:

```typescript
const consumer = new RabbitMQConsumer(queueManager);


    const queueName = "exampleQueue";

    await consumer.consume(queueName, (msg) => {
        console.log(`Received message: ${msg}`);
    });

```

## **API Reference**

### QueueManager

**Constructor:** `new QueueManager(url: string)`  
Initializes a connection manager for RabbitMQ.

**Methods:**
- `closeAll()`: Closes all connections and channels.

### RabbitMQProducer

**Constructor:** `new RabbitMQProducer(queueManager: QueueManager)`  
Creates a producer instance.

**Methods:**
- `send(queueName: string, message: any)`: Publishes a message to the specified queue.

### RabbitMQConsumer

**Constructor:** `new RabbitMQConsumer(queueManager: QueueManager)`  
Creates a consumer instance.

**Methods:**
- `consume(queueName: string, callback: (message: string) => void)`: Listens for messages from the specified queue and processes them using the provided callback.

## **Configuration**

The library uses the RabbitMQ URL for connecting to the server. The URL format is:

```
amqp://<username>:<password>@<host>
```

Example:

```
amqp://admin:StrongPassword123@localhost
```

## **Testing**

Run unit tests using Jest:

```bash
npm run test
```

## **Contributing**

Contributions are welcome! Please fork the repository and create a pull request for any improvements or new features.

## **License**

This project is licensed under the MIT License. See the LICENSE file for details.

## **Support**

For any issues or feature requests, please create an issue on GitHub.