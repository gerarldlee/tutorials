package rnd.statemachine;

public class ProcessException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public ProcessException(String message) {
        super(message);
    }
    
    public ProcessException(String message, Throwable e) {
        super(message, e);
    }
}
