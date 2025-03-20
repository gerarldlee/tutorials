package rnd.statemachine.order;

import rnd.statemachine.ProcessData;
import rnd.statemachine.Processor;

public class OrderProcessor implements Processor {

    @Override
    public ProcessData process(ProcessData data) {

        ((OrderData) data).setMessage("Order created, Taxes 12.00, Shipping 123.00, Total 1234.00, orderId = " + ((OrderData) data).getOrderId());
        ((OrderData) data).setEvent(OrderEvent.ORDERCREATED);
        return data;
    }

}
