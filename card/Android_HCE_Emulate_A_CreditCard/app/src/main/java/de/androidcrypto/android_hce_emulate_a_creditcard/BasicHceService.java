package de.androidcrypto.android_hce_emulate_a_creditcard;

import static de.androidcrypto.android_hce_emulate_a_creditcard.MyHostApduServiceSimple.byteArrayToHexString;

import android.nfc.cardemulation.HostApduService;
import android.os.Bundle;
import android.util.Log;

public class BasicHceService extends HostApduService {
    private static final String TAG = "HCE";

    @Override
    public byte[] processCommandApdu(byte[] commandApdu, Bundle bundle) {
        Log.i(TAG, "Received APDU: " + byteArrayToHexString(commandApdu));
        return new byte[0];
    }

    @Override
    public void onDeactivated(int i) {

    }
}
