package de.androidcrypto.android_hce_emulate_a_creditcard;

import static de.androidcrypto.android_hce_emulate_a_creditcard.Utils.bytesToHexNpe;
import static de.androidcrypto.android_hce_emulate_a_creditcard.Utils.hexStringToByteArray;

import android.content.Context;
import android.content.Intent;
import android.nfc.cardemulation.HostApduService;
import android.os.Bundle;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import java.nio.charset.StandardCharsets;

public class HceCcEmulationServiceBasic extends HostApduService {

    private static final byte[] RESPONSE_OK_SW = hexStringToByteArray("9000");

    @Override
    public byte[] processCommandApdu(byte[] commandApdu, Bundle bundle) {
        sendMessageToActivity("# processCommandApdu received", bytesToHexNpe(commandApdu));
        //sendUsingStaticallyRegisteredBroadcastReceiver("# processCommandApdu received " + bytesToHexNpe(bytes));
        System.out.println("processCommandApdu: " + bytesToHexNpe(commandApdu));
        System.out.println("processCommandApdu: " + new String(commandApdu, StandardCharsets.UTF_8));

        // in any other case response an 'OK'
        return RESPONSE_OK_SW;
    }

    @Override
    public void onDeactivated(int reason) {
        sendMessageToActivity("onDeactivated with reason", String.valueOf(reason));
    }

    /**
     * A utility method to send data with an Broadcast Intent from this service to the MainActivity class
     *
     * @param msg
     * @param data
     */
    private void sendMessageToActivity(String msg, String data) {
        Intent intent = new Intent("HceCcEmulatorService");
        // You can also include some extra data.
        intent.putExtra("Message", msg);
        intent.putExtra("Data", data);
        Context context = this;
        LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
    }

}
