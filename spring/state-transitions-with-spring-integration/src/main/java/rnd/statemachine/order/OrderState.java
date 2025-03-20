package rnd.statemachine.order;

import rnd.statemachine.ProcessState;

/**  
 * DEFAULT               - CREATE   -> orderProcessor()   -> ORDERCREATED   -> PAYMENTPENDING
 * PAYMENTPENDING        - PAY      -> paymentProcessor() -> PAYMENTERROR   -> PAYMENTERROREMAILSENT
 * PAYMENTERROREMAILSENT - RETRYPAY -> paymentProcessor() -> PAYMENTSUCCESS -> PAYMENTSUCCESS
 * PAYMENTPENDING        - PAY      -> paymentProcessor() -> PAYMENTSUCCESS -> PAYMENTSUCCESS
 */
public enum OrderState implements ProcessState {
    DEFAULT,
    PAYMENTPENDING,
    PAYINPROGRESS,
    PAYMENTERROREMAILSENT,
    RETRYPAYINPROGRESS,
    PAYMENTSUCCESSEMAILSENT
}
