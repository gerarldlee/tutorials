package rnd.statemachine.order;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import rnd.statemachine.ProcessData;

@Slf4j
@RequiredArgsConstructor
public class PostEventHandler {
	
	private final OrderDbService dbService;
	
	public void handlePostEvent(ProcessData data) {
		log.info("Post-event: " + data.getEvent().toString());
		
		dbService.saveState(((OrderData) data).getOrderId(),
				((OrderState) data.getEvent().nextState()).name());
				
		log.info("Final state: " + this.dbService.getOrderState(((OrderData) data).getOrderId()));		
	}
}
