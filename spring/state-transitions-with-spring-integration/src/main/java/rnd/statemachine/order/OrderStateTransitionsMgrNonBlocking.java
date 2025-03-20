package rnd.statemachine.order;

import org.springframework.context.support.AbstractApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import rnd.statemachine.AbstractStateTransitionsManager;
import rnd.statemachine.ProcessData;
import rnd.statemachine.ProcessException;

/**
 * This facade class manages the state transitions that require 
 * non-blocking response
 */
@Slf4j
@Service
public class OrderStateTransitionsMgrNonBlocking extends AbstractStateTransitionsManager {

	private final OrderDbService dbService;
	private final AbstractApplicationContext applicationContext;
	
	private OrderStateTransitionsMgrNonBlocking(AbstractApplicationContext applicationContext, OrderDbService dbService) {
		this.applicationContext = new ClassPathXmlApplicationContext("/META-INF/spring/integration/MessageChannelConfig.xml", OrderStateTransitionsMgrNonBlocking.class);
		this.dbService = dbService;
	}

	@Override
	protected ProcessData processStateTransition(ProcessData sdata) throws ProcessException {
 
		OrderData data = (OrderData) sdata;
		log.info("Initial state: " + (OrderState)((OrderEvent)data.getEvent()).nextState());
		log.info("Pre-event: " + data.getEvent().toString());
		Message<ProcessData> msg = MessageBuilder.withPayload((ProcessData)data).build();
		long timeout = data.getEvent().getTimeout();
		this.applicationContext.getBean(data.getEvent().getChannelName(), MessageChannel.class).send(msg, timeout);
		return data;
	}

	@Override
	protected boolean hasValidPreState(ProcessData sdata) throws OrderException {

		OrderData data = (OrderData) sdata;
		String inProgressState = ((OrderEvent) data.getEvent()).name()+"INPROGRESSS";
		
		String expectedState = ((OrderState)((OrderEvent) data.getEvent()).nextState()).name();
		String actualState = this.dbService.getOrderState(data.getOrderId());
		boolean result = expectedState.equals(actualState);
		if(result) {
			this.dbService.saveState(data.getOrderId(), inProgressState);
		} else if (inProgressState.equals(this.dbService.getOrderState(data.getOrderId()))) {
			throw new IllegalStateException("The "+(OrderEvent) data.getEvent()+" event is in progress, please try few minutes later.");
		}
		return result;
	}
}
