package rnd.statemachine;
/**
 * The Enum which is configured with state transitions
 * should implement this interface
 */
public interface ProcessEvent {
    public abstract String getChannelName();
    public abstract long getTimeout();   
    public abstract ProcessState nextState();
    public abstract String getMessage();
}
