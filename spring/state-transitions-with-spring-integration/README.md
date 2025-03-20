# state-transitions-with-spring-integration
This Spring Boot Java project revises the [non-blocking-state-machine](https://github.com/mapteb/non-blocking-state-machine) project to use the Spring Integration framework to handle the non-blocking processes.

## Usage

The first step in using the state machine framework is to create a state transitions table as shown below. 
An online order processing system is considered as an example for the demo. The order processing system is assumed to have the following as the allowable state transitions:

|Initial State |Pre-event |   Processor    |        Post-event  |  Final State  |
| --- | --- | --- | --- | --- |  
|DEFAULT     |  CREATE  | orderProcessor()  | ORDERCREATED     |PAYMENTPENDING |
|PAYMENTPENDING   | PAY     | paymentProcessor()  | PAYMENTERROR     |PAYMENTERROREMAILSENT |
|PAYMENTERROREMAILSENT   | RETRYPAY     | paymentProcessor()  | PAYMENTSUCCESS     |PAYMENTSUCCESSEMAILSENT |
|PAYMENTPENDING  |  PAY     | paymentProcessor()  | PAYMENTSUCCESS  | PAYMENTSUCCESSEMAILSENT |

where the [PaymentProcessor](https://github.com/mapteb/state-transitions-with-spring-integration/blob/master/src/main/java/rnd/statemachine/order/PaymentProcessor.java) is considered a long running process and non-blocking. All other processors are assumed synchronous. The above state transitions are configured in Java enums, [OrderState](https://github.com/mapteb/state-transitions-with-spring-integration/blob/master/src/main/java/rnd/statemachine/order/OrderState.java) and [OrderEvent](https://github.com/mapteb/state-transitions-with-spring-integration/blob/master/src/main/java/rnd/statemachine/order/OrderEvent.java).

# Building and running

Build using:\
$ ./gradlew build

Run using:\
$ ./gradlew bootRun

# Testing

The demo includes an [OrderController](https://github.com/mapteb/state-transitions-with-spring-integration/blob/master/src/main/java/rnd/statemachine/order/OrderController.java) with three APIs to test the following scenarios:

### Create an order:

POST http://localhost:8080/order/items

### Make a payment

POST http://localhost:8080/orders/{orderId}/payment/{amount}

### Make a retry-payment

POST http://localhost:8080/orders/{orderId}/retrypayment/{amount}

The project includes a JMeter [test scripts file](https://github.com/mapteb/state-transitions-with-spring-integration/tree/master/src/test/jmeter) where the above APIs can be tested.

### Related Project

The state transitions technique used in this Java project can be easily adapted to front-end JavaScript UI applications. Here is an [example](https://github.com/mapteb/state-transitions-with-webcomponents).

### More Info

More information about this project is also available at this [DZone article](https://dzone.com/articles/implementing-a-state-machine-using-spring-integrat).
