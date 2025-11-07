# RabbitMQ Connect Helper Examples

This directory contains comprehensive examples demonstrating the usage of the RabbitMQ Connect Helper package.

## Prerequisites

Before running the examples, make sure you have:

1. RabbitMQ server running locally or accessible at the default URL
2. Node.js and npm installed
3. The project dependencies installed (`npm install`)

## Running Examples

### Using npm scripts (recommended):

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run specific examples
npm run example:producer:basic
npm run example:producer:advanced
npm run example:producer:enhanced
npm run example:consumer:basic
npm run example:consumer:advanced
npm run example:consumer:enhanced
npm run example:service:comprehensive
npm run example:service:health
npm run example:service:enhanced
```

### Using ts-node directly:

```bash
# Build the project first
npm run build

# Run examples with ts-node
npx ts-node examples/producer/basic-producer.ts
npx ts-node examples/producer/advanced-producer.ts
npx ts-node examples/producer/enhanced-producer.ts
npx ts-node examples/consumer/basic-consumer.ts
npx ts-node examples/consumer/advanced-consumer.ts
npx ts-node examples/consumer/enhanced-consumer.ts
npx ts-node examples/service/comprehensive-service-example.ts
npx ts-node examples/service/health-monitoring.ts
npx ts-node examples/service/enhanced-service-example.ts
```

## Example Categories

### Producer Examples
- **Basic Producer**: Simple message publishing with basic configuration
- **Advanced Producer**: Demonstrates custom headers, exchanges, priorities, and logging
- **Enhanced Producer**: Production-ready patterns with batch sending, priority handling, and enhanced error handling

### Consumer Examples
- **Basic Consumer**: Message consumption with basic error handling and retry logic
- **Advanced Consumer**: Complex message processing with custom transformations and error handling
- **Enhanced Consumer**: Production patterns with consumer management, business logic separation, and timeout protection

### Service Examples
- **Comprehensive Service**: Full service example with health monitoring and metrics
- **Health Monitoring**: Standalone example showing health check and monitoring capabilities
- **Enhanced Service**: Production-ready service with comprehensive error handling, validation, and metrics

## Configuration

By default, all examples connect to RabbitMQ at `amqp://guest:guest@localhost:5672`. You can override this by setting environment variables:

```bash
# Individual variables
RABBITMQ_URL=amqp://user:pass@your-rabbitmq-server:5672 \
RABBITMQ_RECONNECT_DELAY=5000 \
RABBITMQ_MAX_RETRIES=10 \
RABBITMQ_HEARTBEAT=20 \
npm run example:producer:enhanced
```

Or create a `.env` file in your project root:
```env
RABBITMQ_URL=amqp://user:pass@your-rabbitmq-server:5672
RABBITMQ_RECONNECT_DELAY=5000
RABBITMQ_MAX_RETRIES=10
RABBITMQ_HEARTBEAT=20
```

## Examples Overview

### Producer Examples
- **Message Publishing**: Demonstrates sending messages to queues and exchanges
- **Custom Headers**: Shows how to add custom headers and metadata
- **Exchange Types**: Examples using direct, topic, and fanout exchanges
- **Priority Messaging**: Examples of prioritizing messages
- **Batch Processing**: Efficiently sending multiple messages
- **Timeout Protection**: Handling long-running operations

### Consumer Examples
- **Basic Consumption**: Simple message consumption with acknowledgment
- **Error Handling**: Demonstrates retry mechanisms and dead letter queues
- **Message Transformation**: Shows how to transform messages before processing
- **Custom Processing**: Examples with complex business logic
- **Consumer Management**: Advanced consumer lifecycle management
- **Message Validation**: Ensuring message format before processing
- **Timeout Handling**: Protecting against hanging operations

### Service Examples
- **Full Service**: Complete example showing RabbitMQService usage
- **Health Monitoring**: Real-time health status and metrics monitoring
- **Connection Management**: Automatic reconnection and error handling
- **Event-Driven Architecture**: Comprehensive service patterns
- **Production Patterns**: Ready-to-use patterns for production deployment

Each example is fully documented with comments explaining the purpose and functionality of different parts of the code.