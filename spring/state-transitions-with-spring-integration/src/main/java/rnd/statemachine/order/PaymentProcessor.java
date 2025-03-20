package rnd.statemachine.order;

import rnd.statemachine.ProcessData;
import rnd.statemachine.Processor;

public class PaymentProcessor implements Processor {
    
    @Override
    public ProcessData process(ProcessData data) {
        try{
            //simulate a long running process
            Thread.sleep(1000L);

            if(((OrderData)data).getPayment() > 0) {
                ((OrderData)data).setEvent(OrderEvent.PAYMENTSUCCESS);
                //TODO: send payment success email
            } else {
                ((OrderData)data).setEvent(OrderEvent.PAYMENTERROR);
                //TODO: send payment error email
            }
        }catch(InterruptedException e){
            //TODO: Use a new state transition to include system error
        }
		return data;
	}
}
