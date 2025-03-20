package rnd.statemachine;

public abstract class AbstractStateTransitionsManager implements StateTransitionsManager {

    @Override
    public ProcessData processPreEvent(ProcessData data) throws ProcessException {
    	if(hasValidPreState(data)) {
    		return processStateTransition(data);
    	} else {
    		throw new ProcessException("Invalid state error.");
    	}
    }
    
    protected abstract boolean hasValidPreState(ProcessData data);

    protected abstract ProcessData processStateTransition(ProcessData data) throws ProcessException;
}
