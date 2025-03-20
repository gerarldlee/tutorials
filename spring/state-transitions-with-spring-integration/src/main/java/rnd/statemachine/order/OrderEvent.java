package rnd.statemachine.order;

import rnd.statemachine.ProcessEvent;
import rnd.statemachine.ProcessState;

/**  
 * DEFAULT               - CREATE   -> orderProcessor()   -> ORDERCREATED   -> PAYMENTPENDING
 * PAYMENTPENDING        - PAY      -> paymentProcessor() -> PAYMENTERROR   -> PAYMENTERROREMAILSENT
 * PAYMENTERROREMAILSENT - RETRYPAY -> paymentProcessor() -> PAYMENTSUCCESS -> PAYMENTSUCCESS
 * PAYMENTPENDING        - PAY      -> paymentProcessor() -> PAYMENTSUCCESS -> PAYMENTSUCCESS
 */
public enum OrderEvent implements ProcessEvent {

    CREATE {
        @Override
        public String getChannelName() {
            return "createChannel";
        }

        /**
         * This event has no effect on state so return current state
         */
        @Override
        public ProcessState nextState() {
            return OrderState.DEFAULT;
        }

        @Override
        public String getMessage() {
            return "Order submitted";
        }

        @Override
        public long getTimeout() {
            //by setting the timeout a negative value
            //we are making this a blocking message communication.
             return -1;
        }
    },
    ORDERCREATED {
        /**
         * This post-event does not trigger any process So return null
         */
        @Override
        public String getChannelName() {
            return null;
        }

        @Override
        public ProcessState nextState() {
            return OrderState.PAYMENTPENDING;
        }

        @Override
        public String getMessage() {
            return "Order created, payment pending";
        }

        @Override
        public long getTimeout() {
            //by setting the timeout to zero 
            //we are making this a non-blocking message communication.
            return 0;
        }
    },
    PAY {
        @Override
        public String getChannelName() {
            return "payChannel";
        }

        /**
         * This event has no effect on state so return current state
         */
        @Override
        public ProcessState nextState() {
            return OrderState.PAYMENTPENDING;
        }

        @Override
        public String getMessage() {
            return "We are processing your payment, please check your email for the order confirmation number";
        }

        @Override
        public long getTimeout() {
            //by setting the timeout to zero 
            //we are making this a non-blocking message communication.
        	return 0;
        }
    },
    RETRYPAY {
        /**
         * This post-event does not trigger any process So return null
         */
        @Override
        public String getChannelName() {
            return "payChannel";
        }

        @Override
        public ProcessState nextState() {
            return OrderState.PAYMENTERROREMAILSENT;
        }

        @Override
        public String getMessage() {
            return "We are processing your payment, please check your email for the order confirmation number";
        }

        @Override
        public long getTimeout() {
            return 0;
        }
    },
    PAYMENTSUCCESS {
        /**
         * This post-event does not trigger any process So return null
         */
        @Override
        public String getChannelName() {
            return null;
        }

        @Override
        public ProcessState nextState() {
            return OrderState.PAYMENTSUCCESSEMAILSENT;
        }

        @Override
        public String getMessage() {
            return "Payment success, email sent";
        }

        @Override
        public long getTimeout() {
            return 0;
        }
    },
    PAYMENTERROR {
        /**
         * This post-event does not trigger any process So return null
         */
        @Override
        public String getChannelName() {
            return null;
        }

        @Override
        public ProcessState nextState() {
            return OrderState.PAYMENTERROREMAILSENT;
        }

        @Override
        public String getMessage() {
            return "Payment processing error, email sent";
        }

        @Override
        public long getTimeout() {
            return 0;
        }
    } 
}
