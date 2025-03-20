package rnd.statemachine;

public interface StateTransitionsManager {
    public ProcessData processPreEvent(ProcessData data) throws ProcessException;
}
