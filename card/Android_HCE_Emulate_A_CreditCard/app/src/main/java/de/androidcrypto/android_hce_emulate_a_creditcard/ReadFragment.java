package de.androidcrypto.android_hce_emulate_a_creditcard;

import static android.content.Context.VIBRATOR_SERVICE;
import static de.androidcrypto.android_hce_emulate_a_creditcard.Utils.byteToHex;
import static de.androidcrypto.android_hce_emulate_a_creditcard.Utils.byteToInt;
import static de.androidcrypto.android_hce_emulate_a_creditcard.Utils.bytesToHexNpe;
import static de.androidcrypto.android_hce_emulate_a_creditcard.Utils.divideArray;
import static de.androidcrypto.android_hce_emulate_a_creditcard.Utils.doVibrate;
import static de.androidcrypto.android_hce_emulate_a_creditcard.Utils.hexToBytes;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.media.MediaPlayer;
import android.net.Uri;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.IsoDep;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.fragment.app.Fragment;

import com.github.devnied.emvnfccard.utils.TlvUtil;
import com.payneteasy.tlv.BerTag;
import com.payneteasy.tlv.BerTlv;
import com.payneteasy.tlv.BerTlvParser;
import com.payneteasy.tlv.BerTlvs;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.List;

import mehdi.sakout.aboutpage.AboutPage;
import mehdi.sakout.aboutpage.Element;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link ReadFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class ReadFragment extends Fragment implements NfcAdapter.ReaderCallback {

    // TODO: Rename parameter arguments, choose names that match
    // the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
    private static final String ARG_PARAM1 = "param1";
    private static final String ARG_PARAM2 = "param2";
    private static final String TAG = "ReadFragment";

    // TODO: Rename and change types of parameters
    private String mParam1;
    private String mParam2;


    private com.google.android.material.textfield.TextInputEditText etData, etLog;
    private View loadingLayout;
    private NfcAdapter mNfcAdapter;

    private String outputString = ""; // used for the UI output
    private String exportString = ""; // used for exporting the log to a text file
    private String exportStringFileName = "emv.html";
    private final String stepSeparatorString = "*********************************";
    private final String lineSeparatorString = "---------------------------------";
    Context context;

    public ReadFragment() {
        // Required empty public constructor
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @param param2 Parameter 2.
     * @return A new instance of fragment ReceiveFragment.
     */
    // TODO: Rename and change types and number of parameters
    public static ReadFragment newInstance(String param1, String param2) {
        ReadFragment fragment = new ReadFragment();
        Bundle args = new Bundle();
        args.putString(ARG_PARAM1, param1);
        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    private TextView readResult;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            mParam1 = getArguments().getString(ARG_PARAM1);
            mParam2 = getArguments().getString(ARG_PARAM2);
        }
        mNfcAdapter = NfcAdapter.getDefaultAdapter(this.getContext());
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        readResult = getView().findViewById(R.id.tvReadResult);
        loadingLayout = getView().findViewById(R.id.loading_layout);

        Toolbar myToolbar = (Toolbar) getView().findViewById(R.id.main_toolbar);
        ((AppCompatActivity) getActivity()).setSupportActionBar(myToolbar);

        etData = getView().findViewById(R.id.etData);
        etLog = getView().findViewById(R.id.etLog);
        loadingLayout = getView().findViewById(R.id.loading_layout);

        context = getView().getContext().getApplicationContext();
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_read, container, false);
    }

    // This method is running in another thread when a card is discovered
    // This method cannot cannot direct interact with the UI Thread
    // Use `runOnUiThread` method to change the UI from this method

    public void onTagDiscovered_Old(Tag tag) {
        System.out.println("NFC tag discovered");
        playSinglePing();

        setLoadingLayoutVisibility(true);
        outputString = "";

        requireActivity().runOnUiThread(() -> {
            readResult.setBackgroundColor(getResources().getColor(R.color.white));
            readResult.setText("");
        });

        IsoDep isoDep = IsoDep.get(tag);
        if (isoDep == null) {
            Log.e(TAG, "isoDep is NULL, aborted");
            writeToUiAppend("The tag is not readable with IsoDep class, sorry");
            writeToUiFinal(readResult);
            setLoadingLayoutVisibility(false);
            returnOnNotSuccess();
            return;
        } else {
            Log.i(TAG, "isoDep is available");
        }

        byte[] tagId = isoDep.getTag().getId();
        writeToUiAppend("TagId: " + bytesToHexNpe(tagId));

        try {
            isoDep.connect();
            byte[] command, response;

            String aidString = "F22334455667";
            byte[] aid = Utils.hexStringToByteArray(aidString);
            command = selectApdu(aid);
            response = isoDep.transceive(command);
            writeToUiAppend("selectApdu with AID: " + bytesToHexNpe(command));
            if (response == null) {
                writeToUiAppend("selectApdu with AID fails (null), aborted");
                return;
            } else {
                writeToUiAppend("response length: " + response.length + " data: " + bytesToHexNpe(response));
                Log.i(TAG, "response: " + bytesToHexNpe(response));
            }

            // asking for data in file 01
            int fileNumber01 = 1;
            command = getDataApdu(fileNumber01);
            response = isoDep.transceive(command);
            writeToUiAppend("getDataApdu with file01: " + bytesToHexNpe(command));
            if (response == null) {
                writeToUiAppend("getDataApdu with file01 fails (null)");
            } else {
                writeToUiAppend("response length: " + response.length + " data: " + bytesToHexNpe(response));
            }
            // verify response
            if (checkResponse(response)) {
                writeToUiAppend(new String(returnDataBytes(response), StandardCharsets.UTF_8));
                Log.i(TAG, "response: " + bytesToHexNpe(returnDataBytes(response)));
            } else {
                writeToUiAppend("The tag returned NOT OK");
                Log.i(TAG, "The tag returned NOT OK");
            }

            // read previous content of file 02
            int fileNumber02 = 2;
            command = getDataApdu(fileNumber02);
            response = isoDep.transceive(command);
            writeToUiAppend("getDataApdu with file02: " + bytesToHexNpe(command));
            if (response == null) {
                writeToUiAppend("getDataApdu with file02 fails (null)");
            } else {
                writeToUiAppend("response length: " + response.length + " data: " + bytesToHexNpe(response));
            }
            // verify response
            if (checkResponse(response)) {
                writeToUiAppend(new String(returnDataBytes(response), StandardCharsets.UTF_8));
                Log.i(TAG, "response: " + bytesToHexNpe(returnDataBytes(response)));
            } else {
                writeToUiAppend("The tag returned NOT OK");
                Log.i(TAG, "The tag returned NOT OK");
            }

            // write data to fileNumber 02
            byte[] dataToWrite = "New Content in fileNumber 02".getBytes(StandardCharsets.UTF_8);
            command = putDataApdu(fileNumber02, dataToWrite);
            response = isoDep.transceive(command);
            writeToUiAppend("putDataApdu with file02: " + bytesToHexNpe(command));
            if (response == null) {
                writeToUiAppend("putDataApdu with file02 fails (null)");
            } else {
                writeToUiAppend("response length: " + response.length + " data: " + bytesToHexNpe(response));
            }
            // verify response
            if (checkResponse(response)) {
                writeToUiAppend("SUCCESS");
                Log.i(TAG, "response: " + bytesToHexNpe(returnDataBytes(response)));
            } else {
                writeToUiAppend("The tag returned NOT OK");
                Log.i(TAG, "The tag returned NOT OK");
            }

            // read updated content
            command = getDataApdu(fileNumber02);
            response = isoDep.transceive(command);
            writeToUiAppend("getDataApdu with file02: " + bytesToHexNpe(command));
            if (response == null) {
                writeToUiAppend("getDataApdu with file02 fails (null)");
            } else {
                writeToUiAppend("response length: " + response.length + " data: " + bytesToHexNpe(response));
            }
            // verify response
            if (checkResponse(response)) {
                writeToUiAppend(new String(returnDataBytes(response), StandardCharsets.UTF_8));
                Log.i(TAG, "response: " + bytesToHexNpe(returnDataBytes(response)));
            } else {
                writeToUiAppend("The tag returned NOT OK");
                Log.i(TAG, "The tag returned NOT OK");
            }

            isoDep.close();
        } catch (IOException e) {
            writeToUiAppend("IOException on connection: " + e.getMessage());
            Log.e(TAG, "IOException on connection: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            writeToUiAppend("Exception on connection: " + e.getMessage());
            Log.e(TAG, "Exception on connection: " + e.getMessage());
            e.printStackTrace();
        }

        writeToUiFinal(readResult);
        playDoublePing();
        setLoadingLayoutVisibility(false);
        doVibrate(getActivity());
    }

    @Override
    public void onTagDiscovered(Tag tag) {

        Steps steps = new Steps();

        clearData();
        Log.d(TAG, "NFC tag discovered");
        writeToUiAppend("NFC tag discovered");
        playSinglePing();
        setLoadingLayoutVisibility(true);
        byte[] tagId = tag.getId();
        writeToUiAppend("TagId: " + bytesToHexNpe(tagId));
        String[] techList = tag.getTechList();
        writeToUiAppend("TechList found with these entries:");
        boolean isoDepInTechList = false;
        for (String s : techList) {
            writeToUiAppend(s);
            if (s.equals("android.nfc.tech.IsoDep")) isoDepInTechList = true;
        }
        // proceed only if tag has IsoDep in the techList
        if (isoDepInTechList) {
            IsoDep nfc = null;
            nfc = IsoDep.get(tag);
            if (nfc != null) {
                try {
                    nfc.connect();
                    Log.d(TAG, "connection with card success");
                    writeToUiAppend("connection with card success");
                    // here we are going to start our journey through the card

                    printStepHeader(0, "our journey begins");
                    writeToUiAppend(etData, "00 reading of the card started");

                    writeToUiAppend("increase IsoDep timeout for long lasting reading");
                    writeToUiAppend("timeout old: " + nfc.getTimeout() + " ms");
                    nfc.setTimeout(10000);
                    writeToUiAppend("timeout new: " + nfc.getTimeout() + " ms");


                    /**
                     * step 1 code start
                     */

                    printStepHeader(1, "select PPSE");
                    byte[] PPSE = "2PAY.SYS.DDF01".getBytes(StandardCharsets.UTF_8); // PPSE
                    byte[] selectPpseCommand = selectApdu(PPSE);
                    byte[] selectPpseResponse = nfc.transceive(selectPpseCommand);
                    writeToUiAppend("01 select PPSE command  length " + selectPpseCommand.length + " data: " + bytesToHexNpe(selectPpseCommand));
                    writeToUiAppend("01 select PPSE response length " + selectPpseResponse.length + " data: " + bytesToHexNpe(selectPpseResponse));
                    writeToUiAppend(etData, "01 select PPSE completed");
                    writeToUiAppend(prettyPrintDataToString(selectPpseResponse));

                    byte[] selectPpseResponseOk = steps.checkResponse(selectPpseResponse);
                    // proceed only when te do have a positive read result = 0x'9000' at the end of response data
                    if (selectPpseResponseOk != null) {

                        /**
                         * step 2 code start
                         */

                        //writeToUiAppend("");
                        printStepHeader(2, "search applications on card");
                        writeToUiAppend("02 analyze select PPSE response and search for tag 0x4F (applications on card)");

                        BerTlvParser parser = new BerTlvParser();
                        BerTlvs tlv4Fs = parser.parse(selectPpseResponseOk);
                        // find all entries for tag 0x4f
                        List<BerTlv> tag4fList = tlv4Fs.findAll(new BerTag(0x4F));
                        if (tag4fList.size() < 1) {
                            writeToUiAppend("there is no tag 0x4F available, stopping here");
                            startEndSequence(nfc);
                        }
                        writeToUiAppend("Found tag 0x4F " + tag4fList.size() + (tag4fList.size() == 1 ? " time:" : " times:"));
                        ArrayList<byte[]> aidList = new ArrayList<>();
                        for (int i4f = 0; i4f < tag4fList.size(); i4f++) {
                            BerTlv tlv4f = tag4fList.get(i4f);
                            byte[] tlv4fBytes = tlv4f.getBytesValue();
                            aidList.add(tlv4fBytes);
                            writeToUiAppend("application Id (AID): " + bytesToHexNpe(tlv4fBytes));
                        }
                        writeToUiAppend(etData, "02 analyze select PPSE response completed");

                        /**
                         * step 2 code end
                         */

                        /**
                         * step 3 code start
                         */

                        // step 03: iterating through aidList by selecting AID
                        for (int aidNumber = 0; aidNumber < tag4fList.size(); aidNumber++) {
                            byte[] aidSelected = aidList.get(aidNumber);
                            writeToUiAppend("");
                            printStepHeader(3, "select application by AID");
                            writeToUiAppend("03 select application by AID " + bytesToHexNpe(aidSelected) + " (number " + (aidNumber + 1) + ")");
                            byte[] selectAidCommand = selectApdu(aidSelected);
                            byte[] selectAidResponse = nfc.transceive(selectAidCommand);
                            writeToUiAppend("");
                            writeToUiAppend("03 select AID command  length " + selectAidCommand.length + " data: " + bytesToHexNpe(selectAidCommand));
                            writeToUiAppend("03 select AID response length " + selectAidResponse.length + " data: " + bytesToHexNpe(selectAidResponse));
                            writeToUiAppend(prettyPrintDataToString(selectAidResponse));
                            writeToUiAppend(etData, "03 select AID completed");

                            /**
                             * step 4 code start
                             */

                            byte[] selectAidResponseOk = steps.checkResponse(selectAidResponse);
                            if (selectAidResponseOk != null) {
                                //writeToUiAppend("");
                                printStepHeader(4, "search for tag 0x9F38");
                                writeToUiAppend("04 search for tag 0x9F38 in the selectAid response");
                                /**
                                 * note: different behaviour between VisaCard, Mastercard and German GiroCards
                                 * Mastercard has NO PDOL, Visa gives PDOL in tag 9F38
                                 * next step: search for tag 9F38 Processing Options Data Object List (PDOL)
                                 */

                                /*
                                Caught a RuntimeException from the binder stub implementation.
                                java.lang.IllegalStateException: At position 1 the len is more then 3 [36]
	                            at com.payneteasy.tlv.BerTlvParser.getDataLength(BerTlvParser.java:205)
	                            That can happe when invalid are used to get parsed.
                                 */
                                System.out.println("selectAidResponseOk: " + bytesToHexNpe(selectAidResponseOk));
                                BerTlv tag9f38;
                                try {
                                    BerTlvs tlvsAid = parser.parse(selectAidResponseOk);
                                    tag9f38 = tlvsAid.find(new BerTag(0x9F, 0x38));
                                    writeToUiAppend(etData, "04 search for tag 0x9F38 in the selectAid response completed");
                                } catch (IllegalStateException e) {
                                    tag9f38 = null;
                                    Log.e(TAG, "Parsing invalid data: " + e.getMessage());
                                }
                                byte[] gpoRequestCommand;

                                // comment this out for regular workflow
                                DolValues dolValues = new DolValues();
                                writeToUiAppend("Available predefined values for PDOL and CDOL");
                                writeToUiAppend(dolValues.dump());

                                if (tag9f38 != null) {
                                    /**
                                     * the following code is for VisaCards and (German) GiroCards as we found a PDOL
                                     */
                                    writeToUiAppend("");
                                    writeToUiAppend("### processing the American Express, VisaCard and GiroCard path ###");
                                    writeToUiAppend("");
                                    byte[] pdolValue = tag9f38.getBytesValue();

                                    writeToUiAppend("found tag 0x9F38 (PDOL) in the selectAid with this length: " + pdolValue.length + " data: " + bytesToHexNpe(pdolValue));
                                    byte[][] gpoRequestCommandArray = steps.getGpoFromPdolExtended(pdolValue, new byte[]{(byte) 0x00}); // 00 = default, maximum 03

                                    gpoRequestCommand = gpoRequestCommandArray[0];
                                    String pdolRequestString = new String(gpoRequestCommandArray[1], StandardCharsets.UTF_8);
                                    writeToUiAppend("");
                                    writeToUiAppend(pdolRequestString);
                                } else { // if (tag9f38 != null) {
                                    /**
                                     * MasterCard code
                                     */
                                    writeToUiAppend("");
                                    writeToUiAppend("### processing the MasterCard path ###");
                                    writeToUiAppend("");

                                    writeToUiAppend("No PDOL found in the selectAid response, generating a 'null' PDOL");
                                    //gpoRequestCommand = getGpoFromPdol(new byte[0]); // empty PDOL
                                    byte[][] gpoRequestCommandArray = steps.getGpoFromPdolExtended(new byte[0], new byte[]{(byte) 0x00});
                                    gpoRequestCommand = gpoRequestCommandArray[0];
                                    String pdolRequestString = new String(gpoRequestCommandArray[1], StandardCharsets.UTF_8);
                                    writeToUiAppend("");
                                    writeToUiAppend(pdolRequestString);
                                }

                                //writeToUiAppend("");
                                printStepHeader(5, "get the processing options");
                                writeToUiAppend("05 get the processing options  command length: " + gpoRequestCommand.length + " data: " + bytesToHexNpe(gpoRequestCommand));

                                /**
                                 * step 5 code starts
                                 */

                                /**
                                 * WARNING: each get processing options request increases the icc internal
                                 * 'application transaction counter'. If the 2 byte long counter reaches the
                                 * maximum of '65535' (0xFFFF) the card will no longer accept any read commands
                                 * and the card is irretrievable damaged.
                                 * DO NOT RUN THIS COMMAND IN A LOOP !
                                 */

                                byte[] gpoRequestResponse = nfc.transceive(gpoRequestCommand);
                                byte[] gpoRequestResponseOk;
                                writeToUiAppend(etData, "05 get the processing options completed");
                                if (gpoRequestResponse != null) {
                                    writeToUiAppend("05 get the processing options response length: " + gpoRequestResponse.length + " data: " + bytesToHexNpe(gpoRequestResponse));
                                    gpoRequestResponseOk = steps.checkResponse(gpoRequestResponse);
                                    if (gpoRequestResponseOk != null) {
                                        writeToUiAppend(prettyPrintDataToString(gpoRequestResponse));
                                    }

                                } else {
                                    writeToUiAppend(etData, "05 get the processing options failed");
                                    writeToUiAppend("The command for get processing options failed. It might be a good idea to use an alternate tag 0x9966 Terminal Transaction Qualifiers");
                                    startEndSequence(nfc);
                                    // the app will end here
                                }

                                /**
                                 * step 5 code end
                                 */

                                /**
                                 * step 6 code start
                                 */

                                // parse content of gpoResponse to get Track 2 or AFL

                                /**
                                 * We do have 3 scenarios to work with:
                                 * a) the response contains a Track 2 Equivalent Data tag (tag 0x57)
                                 * b) the response is of type 'Response Message Template Format 1' (tag 0x80)
                                 * c) the response is of type 'Response Message Template Format 2' (tag 0x77)
                                 */
                                BerTlvs tlvsGpo = parser.parse(gpoRequestResponse);
                                byte[] aflBytes = null;

                                /**
                                 * workflow a)
                                 * The response contains a Track 2 Equivalent Data tag and from this we can directly
                                 * retrieve the Primary Application Number (PAN, here the Credit Card Number)
                                 * found using a VisaCard
                                 */

                                BerTlv tag57 = tlvsGpo.find(new BerTag(0x57));
                                if (tag57 != null) {
                                    //writeToUiAppend("");
                                    writeToUiAppend("workflow a)");
                                    writeToUiAppend("");
                                    printStepHeader(6, "read files & search PAN");
                                    writeToUiAppend("06 read the files from card skipped");
                                    writeToUiAppend(etData, "06 read the files from card skipped");

                                    writeToUiAppend("the response contains a Track 2 Equivalent Data tag [tag 0x57]");

                                    /**
                                     * step 7 code start
                                     */

                                    writeToUiAppend("the response contains a Track 2 Equivalent Data tag [tag 0x57]");
                                    byte[] gpoResponseTag57 = tag57.getBytesValue();
                                    writeToUiAppend("found tag 0x57 in the gpoResponse length: " + gpoResponseTag57.length + " data: " + bytesToHexNpe(gpoResponseTag57));
                                    String pan = steps.getPanFromTrack2EquivalentData(gpoResponseTag57);
                                    String expDate = steps.getExpirationDateFromTrack2EquivalentData(gpoResponseTag57);
                                    writeToUiAppend("found a PAN " + pan + " with Expiration date: " + expDate);
                                    writeToUiAppend("");
                                    printStepHeader(7, "print PAN & expire date");
                                    writeToUiAppend("07 get PAN and Expiration date from tag 0x57 (Track 2 Equivalent Data)");
                                    writeToUiAppend(etData, "07 get PAN and Expiration date from tag 0x57 (Track 2 Equivalent Data) completed");
                                    writeToUiAppend("data for AID " + bytesToHexNpe(aidSelected));
                                    writeToUiAppend("PAN: " + pan);
                                    String expirationDateString = "Expiration date (" + (expDate.length() == 4 ? "YYMM): " : "YYMMDD): ") + expDate;
                                    writeToUiAppend(expirationDateString);
                                    writeToUiAppend(etData, "data for AID " + bytesToHexNpe(aidSelected));
                                    writeToUiAppend(etData,"PAN: " + pan);
                                    writeToUiAppend(etData, expirationDateString);
                                    writeToUiAppend("");

                                    /**
                                     * step 7 code end
                                     */

                                }

                                /**
                                 * workflow b)
                                 * The response is of type 'Response Message Template Format 1' and we need to know
                                 * the meaning of each byte, so we need to parse the content to get the data for the
                                 * 'Application File Locator' (AFL).
                                 * found using a American Express Card
                                 */

                                BerTlv tag80 = tlvsGpo.find(new BerTag(0x80));
                                if (tag80 != null) {
                                    //writeToUiAppend("");
                                    writeToUiAppend("workflow b)");
                                    writeToUiAppend("the response is of type 'Response Message Template Format 1' [tag 0x80]");
                                    byte[] gpoResponseTag80 = tag80.getBytesValue();
                                    writeToUiAppend("found tag 0x80 in the gpoResponse length: " + gpoResponseTag80.length + " data: " + bytesToHexNpe(gpoResponseTag80));
                                    aflBytes = Arrays.copyOfRange(gpoResponseTag80, 2, gpoResponseTag80.length);
                                }


                                /**
                                 * workflow c)
                                 * The response is of type 'Response Message Template Format 2' and we need to find
                                 * tag 0x94; the content is the 'Application File Locator' (AFL)
                                 * found using a MasterCard
                                 */

                                BerTlv tag77 = tlvsGpo.find(new BerTag(0x77));
                                if (tag77 != null) {
                                    //writeToUiAppend("");
                                    writeToUiAppend("workflow c)");
                                    writeToUiAppend("the response is of type 'Response Message Template Format 2' [tag 0x77]");
                                    writeToUiAppend("found tag 0x77 in the gpoResponse");
                                }
                                BerTlv tag94 = tlvsGpo.find(new BerTag(0x94));
                                if (tag94 != null) {
                                    writeToUiAppend("found 'AFL' [tag 0x94] in the response of type 'Response Message Template Format 2' [tag 0x77]");
                                    byte[] gpoResponseTag94 = tag94.getBytesValue();
                                    writeToUiAppend("found tag 0x94 in the gpoResponse length: " + gpoResponseTag94.length + " data: " + bytesToHexNpe(gpoResponseTag94));
                                    aflBytes = gpoResponseTag94;
                                }

                                writeToUiAppend("");
                                printStepHeader(6, "read files & search PAN");
                                writeToUiAppend("06 read the files from card and search for PAN & Expiration date");
                                writeToUiAppend(etData, "06 read the files from card and search for PAN & Expiration date");

                                List<byte[]> tag94BytesList = divideArray(aflBytes, 4);
                                int tag94BytesListLength = tag94BytesList.size();
                                //writeToUiAppend(etLog, "tag94Bytes divided into " + tag94BytesListLength + " arrays");
                                writeToUiAppend("");
                                writeToUiAppend("The AFL contains " + tag94BytesListLength + (tag94BytesListLength == 1 ? " entry to read" : " entries to read"));

                                // the AFL is a 4 byte long byte array, so I your aflBytes array is 12 bytes long there are three sets to read.

                                /**
                                 * now we are going to read the specified files from the card. The system is as follows:
                                 * The first byte is the SFI, the second byte the first record to read,
                                 * the third byte is the last record to read and byte 4 gives the number
                                 * of sectors involved in offline authorization.
                                 * Here an example: 10 01 03 00
                                 * SFI:             10
                                 * first record:       01
                                 * last record:           03
                                 * offline:                  00
                                 * means that we are asked to read 3 records (number 1, 2 and 3) from SFI 10
                                 *
                                 * The fourth byte codes the number of records involved in offline data
                                 * authentication starting with the record number coded in the second byte. The
                                 * fourth byte may range from zero to the value of the third byte less the value of
                                 * the second byte plus 1.
                                 */

                                for (int i = 0; i < tag94BytesListLength; i++) {
                                    byte[] tag94BytesListEntry = tag94BytesList.get(i);
                                    byte sfiOrg = tag94BytesListEntry[0];
                                    byte rec1 = tag94BytesListEntry[1];
                                    byte recL = tag94BytesListEntry[2];
                                    byte offl = tag94BytesListEntry[3]; // offline authorization
                                    int sfiNew = (byte) sfiOrg | 0x04; // add 4 = set bit 3
                                    int numberOfRecordsToRead = (byteToInt(recL) - byteToInt(rec1) + 1);
                                    writeToUiAppend("for SFI " + byteToHex(sfiOrg) + " we read " + numberOfRecordsToRead + (numberOfRecordsToRead == 1 ? " record" : " records"));
                                    // read records
                                    byte[] readRecordResponse = new byte[0];
                                    for (int iRecord = (int) rec1; iRecord <= (int) recL; iRecord++) {
                                        byte[] cmd = hexToBytes("00B2000400");
                                        cmd[2] = (byte) (iRecord & 0x0FF);
                                        cmd[3] |= (byte) (sfiNew & 0x0FF);
                                        //writeToUiAppend("readRecord  command length: " + cmd.length + " data: " + bytesToHexNpe(cmd));
                                        writeToUiAppend("readRecord SFI " + byteToHex(sfiOrg) + " file " + (int) recL + " command length: " + cmd.length + " data: " + bytesToHexNpe(cmd));
                                        readRecordResponse = nfc.transceive(cmd);
                                        byte[] readRecordResponseTag5a = null;
                                        byte[] readRecordResponseTag5f24 = null;
                                        if (readRecordResponse != null) {
                                            writeToUiAppend("readRecord response length: " + readRecordResponse.length + " data: " + bytesToHexNpe(readRecordResponse));
                                            writeToUiAppend(prettyPrintDataToString(readRecordResponse));
                                            System.out.println("readRecord response length: " + readRecordResponse.length + " data: " + bytesToHexNpe(readRecordResponse));
                                            System.out.println(prettyPrintDataToString(readRecordResponse));

                                            /**
                                             * step 7 code start
                                             */

                                            // checking for PAN and Expiration Date
                                            try {
                                                BerTlvs tlvsReadRecord = parser.parse(readRecordResponse);
                                                BerTlv tag5a = tlvsReadRecord.find(new BerTag(0x5a));
                                                if (tag5a != null) {
                                                    readRecordResponseTag5a = tag5a.getBytesValue();
                                                    writeToUiAppend("found tag 0x5a in the readRecordResponse length: " + readRecordResponseTag5a.length + " data: " + bytesToHexNpe(readRecordResponseTag5a));
                                                }
                                                BerTlv tag5f24 = tlvsReadRecord.find(new BerTag(0x5f, 0x24));
                                                if (tag5f24 != null) {
                                                    readRecordResponseTag5f24 = tag5f24.getBytesValue();
                                                    writeToUiAppend("found tag 0x5f24 in the readRecordResponse length: " + readRecordResponseTag5f24.length + " data: " + bytesToHexNpe(readRecordResponseTag5f24));
                                                }
                                                if (readRecordResponseTag5a != null) {
                                                    String readRecordPanString = steps.removeTrailingF(bytesToHexNpe(readRecordResponseTag5a));
                                                    String readRecordExpirationDateString = bytesToHexNpe(readRecordResponseTag5f24);
                                                    writeToUiAppend("");
                                                    printStepHeader(7, "print PAN & expire date");
                                                    writeToUiAppend("07 get PAN and Expiration date from tags 0x5a and 0x5f24");
                                                    writeToUiAppend(etData, "07 get PAN and Expiration date from tags 0x5a and 0x5f24 completed");
                                                    writeToUiAppend("data for AID " + bytesToHexNpe(aidSelected));
                                                    writeToUiAppend("PAN: " + readRecordPanString);
                                                    String expirationDateString = "Expiration date (" + (readRecordExpirationDateString.length() == 4 ? "YYMM): " : "YYMMDD): ") + readRecordExpirationDateString;
                                                    writeToUiAppend(expirationDateString);
                                                    writeToUiAppend(etData, "data for AID " + bytesToHexNpe(aidSelected));
                                                    writeToUiAppend(etData,"PAN: " + readRecordPanString);
                                                    writeToUiAppend(etData, expirationDateString);
                                                    writeToUiAppend("");
                                                }
                                            } catch (RuntimeException e) {
                                                System.out.println("Runtime Exception: " + e.getMessage());
                                                //startEndSequence(nfc);
                                            }

                                            /**
                                             * step 7 code end
                                             */

                                        } else {
                                            writeToUiAppend("readRecord response was NULL");
                                        }
                                    }
                                }


                                /**
                                 * step 6 code end
                                 */

                            } else { // if (selectAidResponseOk != null) {
                                writeToUiAppend("the selecting AID command failed");
                            }

                            /**
                             * step 4 code end
                             */

                        } // for (int aidNumber = 0; aidNumber < tag4fList.size(); aidNumber++) {

                        /**
                         * step 3 code end
                         */



                    } else {
                        // if (isoDepInTechList) {
                        writeToUiAppend("The discovered NFC tag does not have an IsoDep interface.");
                    }

                    /**
                     * step 1 code end
                     */

                    printStepHeader(99, "our journey ends");
                    writeToUiAppend(etData, "99 reading of the card completed");
                    vibrate();
                } catch (IOException e) {
                    writeToUiAppend("connection with card failure");
                    writeToUiAppend(e.getMessage());
                    // throw new RuntimeException(e);
                    startEndSequence(nfc);
                    return;
                }
            }
        } else {
            // if (isoDepInTechList) {
            writeToUiAppend("The discovered NFC tag does not have an IsoDep interface.");
        }
        // final cleanup
        playDoublePing();
        writeToUiFinal(etLog);
        setLoadingLayoutVisibility(false);
    }


    private void returnOnNotSuccess() {
        writeToUiAppend("=== Return on Not Success ===");
        writeToUiFinal(readResult);
        playDoublePing();
        setLoadingLayoutVisibility(false);
        doVibrate(getActivity());
        mNfcAdapter.disableReaderMode(this.getActivity());
    }

    /**
     * section for emv reading
     */

    private byte[] selectApdu(@NonNull byte[] aid) {
        byte[] commandApdu = new byte[6 + aid.length];
        commandApdu[0] = (byte) 0x00;  // CLA
        commandApdu[1] = (byte) 0xA4;  // INS
        commandApdu[2] = (byte) 0x04;  // P1
        commandApdu[3] = (byte) 0x00;  // P2
        commandApdu[4] = (byte) (aid.length & 0x0FF);       // Lc
        System.arraycopy(aid, 0, commandApdu, 5, aid.length);
        commandApdu[commandApdu.length - 1] = (byte) 0x00;  // Le
        return commandApdu;
    }

    /**
     * getDataApdu is asking for data in file
      * @param file is the identifier on the (emulated) tag
     * @return
     */
    private byte[] getDataApdu(byte[] file) {
        byte[] commandApdu = new byte[6 + file.length];
        commandApdu[0] = (byte) 0x00;  // CLA
        commandApdu[1] = (byte) 0xCA;  // INS
        commandApdu[2] = (byte) 0x00;  // P1
        commandApdu[3] = (byte) 0x00;  // P2
        commandApdu[4] = (byte) (file.length & 0x0FF);       // Lc
        System.arraycopy(file, 0, commandApdu, 5, file.length);
        commandApdu[commandApdu.length - 1] = (byte) 0x00;  // Le
        return commandApdu;
    }

    private byte[] getDataApdu(int file) {
        byte[] commandApdu = new byte[6 + 1]; // 6 + byte length
        commandApdu[0] = (byte) 0x00;  // CLA
        commandApdu[1] = (byte) 0xCA;  // INS
        commandApdu[2] = (byte) 0x00;  // P1
        commandApdu[3] = (byte) 0x00;  // P2
        commandApdu[4] = (byte) 0x01;  // Lc
        commandApdu[5] = (byte) (file & 0x0FF);
        commandApdu[commandApdu.length - 1] = (byte) 0x00;  // Le
        return commandApdu;
    }

    private byte[] putDataApdu(int fileNumber, byte[] dataToWrite) {
        byte[] commandApdu = new byte[6 + 1 + dataToWrite.length]; // 6 + fileNumber + dataToWrite
        commandApdu[0] = (byte) 0x00;  // CLA
        commandApdu[1] = (byte) 0xDA;  // INS
        commandApdu[2] = (byte) 0x00;  // P1
        commandApdu[3] = (byte) 0x00;  // P2
        commandApdu[4] = (byte) ((dataToWrite.length + 1) & 0x0FF);       // Lc
        commandApdu[5] = (byte) (fileNumber & 0x0FF); // file number
        System.arraycopy(dataToWrite, 0, commandApdu, 6, dataToWrite.length); // dataToWrite
        commandApdu[commandApdu.length - 1] = (byte) 0x00;  // Le
        return commandApdu;
    }

    /**
     * checks if the response has an 0x'9000' at the end means success
     * and the method returns true.
     * if any other trailing bytes show up the method returns false
     *
     * @param data
     * @return
     */
    private boolean checkResponse(@NonNull byte[] data) {
        // simple sanity check
        if (data.length < 2) {
            return false;
        } // not ok
        int status = ((0xff & data[data.length - 2]) << 8) | (0xff & data[data.length - 1]);
        if (status == 0x9000) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Return the data without the attached status bytes
     * @param data
     * @return
     */
    private byte[] returnDataBytes(byte[] data) {
        if (data == null) return null;
        if (data.length < 3) return null;
        return Arrays.copyOfRange(data, 0, (data.length - 2));
    }

    /**
     * Sound files downloaded from Material Design Sounds
     * https://m2.material.io/design/sound/sound-resources.html
     */
    private void playSinglePing() {
        MediaPlayer mp = MediaPlayer.create(getContext(), R.raw.notification_decorative_02);
        mp.start();
    }

    private void playDoublePing() {
        MediaPlayer mp = MediaPlayer.create(getContext(), R.raw.notification_decorative_01);
        mp.start();
    }

    /**
     * vibrate
     */
    private void vibrate() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            ((Vibrator) this.getActivity().getSystemService(VIBRATOR_SERVICE))
                    .vibrate(VibrationEffect.createOneShot(150, 10));
        } else {
            Vibrator v = (Vibrator) ((AppCompatActivity) context).getSystemService(VIBRATOR_SERVICE);
//            Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            v.vibrate(200);
        }
    }

    private void writeToUiAppend(String message) {
        //System.out.println(message);
        outputString = outputString + message + "\n";
    }

    private void writeToUiAppend(final TextView textView, String message) {
        this.getActivity().runOnUiThread(() -> {
            if (TextUtils.isEmpty(textView.getText().toString())) {
                if (textView == (TextView) etLog) {
                } else {
                    textView.setText(message);
                }
            } else {
                String newString = textView.getText().toString() + "\n" + message;
                if (textView == (TextView) etLog) {
                } else {
                    textView.setText(newString);
                }
            }
        });
    }

    private void writeToUiFinal(final TextView textView) {
        if (textView == (TextView) readResult) {
            getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    textView.setText(outputString);
                    System.out.println(outputString); // print the data to console
                }
            });
        }
    }

    /**
     * shows a progress bar as long as the reading lasts
     *
     * @param isVisible
     */

    private void setLoadingLayoutVisibility(boolean isVisible) {
        getActivity().runOnUiThread(() -> {
            if (isVisible) {
                loadingLayout.setVisibility(View.VISIBLE);
            } else {
                loadingLayout.setVisibility(View.GONE);
            }
        });
    }

    /**
     * section for NFC
     */

    private void showWirelessSettings() {
        Toast.makeText(this.getContext(), "You need to enable NFC", Toast.LENGTH_SHORT).show();
        Intent intent = new Intent(Settings.ACTION_WIRELESS_SETTINGS);
        startActivity(intent);
    }

    @Override
    public void onResume() {
        super.onResume();

        if (mNfcAdapter != null) {

            if (!mNfcAdapter.isEnabled())
                showWirelessSettings();

            Bundle options = new Bundle();
            // Work around for some broken Nfc firmware implementations that poll the card too fast
            options.putInt(NfcAdapter.EXTRA_READER_PRESENCE_CHECK_DELAY, 250);

            // Enable ReaderMode for NfcA types of card and disable platform sounds
            // the option NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK is NOT set
            // to get the data of the tag after reading
//            mNfcAdapter.enableReaderMode(this.getActivity(),
//                    this,
//                    NfcAdapter.FLAG_READER_NFC_A |
//                            NfcAdapter.FLAG_READER_NO_PLATFORM_SOUNDS,
//                    options);
            mNfcAdapter.enableReaderMode(this.getActivity(),
                    this,
                    NfcAdapter.FLAG_READER_NFC_A |
                            NfcAdapter.FLAG_READER_NFC_B |
                            NfcAdapter.FLAG_READER_NFC_F |
                            NfcAdapter.FLAG_READER_NFC_V |
                            NfcAdapter.FLAG_READER_NFC_BARCODE |
                            NfcAdapter.FLAG_READER_NO_PLATFORM_SOUNDS,
                    options);
        }
    }

    /**
     * important is the disabling of the ReaderMode when activity is pausing
     */

    @Override
    public void onPause() {
        super.onPause();
        if (mNfcAdapter != null)
            mNfcAdapter.disableReaderMode(this.getActivity());
    }


    private void startEndSequence(IsoDep nfc) {
        playDoublePing();
        writeToUiFinal(etLog);
        setLoadingLayoutVisibility(false);
        vibrate();
        try {
            nfc.close();
        } catch (IOException e) {
            // throw new RuntimeException(e);
        }
        return;
    }

    /**
     * prints a nice header for each step
     *
     * @param step
     * @param message
     */
    private void printStepHeader(int step, String message) {
        // message should not extend 29 characters, longer messages will get trimmed
        String emptyMessage = "                                 ";
        StringBuilder sb = new StringBuilder();
        sb.append(outputString); // has already a line feed at the end
        sb.append("").append("\n");
        sb.append(stepSeparatorString).append("\n");
        sb.append("************ step ").append(String.format("%02d", step)).append(" ************").append("\n");
        sb.append("* ").append((message + emptyMessage).substring(0, 29)).append(" *").append("\n");
        sb.append(stepSeparatorString).append("\n");
        outputString = sb.toString();
    }

    /**
     * used for printing the card responses in a human readable format to a string
     *
     * @param responseData
     * @return
     */
    private String prettyPrintDataToString(byte[] responseData) {
        StringBuilder sb = new StringBuilder();
        sb.append("------------------------------------").append("\n");
        sb.append(trimLeadingLineFeeds(TlvUtil.prettyPrintAPDUResponse(responseData))).append("\n");
        sb.append("------------------------------------").append("\n");
        return sb.toString();
    }

    /**
     * trim leading line feeds if existing
     *
     * @param input
     * @return
     */
    public static String trimLeadingLineFeeds(String input) {
        String[] output = input.split("^\\n+", 2);
        return output.length > 1 ? output[1] : output[0];
    }

    private void clearData() {
        this.getActivity().runOnUiThread(() -> {
            outputString = "";
            exportString = "";
            etData.setText("");
            etLog.setText("");
        });
    }


    private void provideTextViewDataForExport(TextView textView) {
        exportString = textView.getText().toString();
    }

    private void writeToUiToast(String message) {
        this.getActivity().runOnUiThread(() -> {
            Toast.makeText(this.getContext(),
                    message,
                    Toast.LENGTH_SHORT).show();
        });
    }

    /**
     * section OptionsMenu export text file methods
     */

    private void exportTextFile() {
        provideTextViewDataForExport(etLog);
        if (exportString.isEmpty()) {
            writeToUiToast("Scan a tag first before writing files :-)");
            return;
        }
        writeStringToExternalSharedStorage();
    }

    private void writeStringToExternalSharedStorage() {
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        // Optionally, specify a URI for the file that should appear in the
        // system file picker when it loads.
        // boolean pickerInitialUri = false;
        // intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI, pickerInitialUri);
        // get filename from edittext
        String filename = exportStringFileName;
        // sanity check
        if (filename.equals("")) {
            writeToUiToast("scan a tag before writing the content to a file :-)");
            return;
        }
        intent.putExtra(Intent.EXTRA_TITLE, filename);
        selectTextFileActivityResultLauncher.launch(intent);
    }

    ActivityResultLauncher<Intent> selectTextFileActivityResultLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            new ActivityResultCallback<ActivityResult>() {
                @Override
                public void onActivityResult(ActivityResult result) {
                    if (result.getResultCode() == Activity.RESULT_OK) {
                        // There are no request codes
                        Intent resultData = result.getData();
                        // The result data contains a URI for the document or directory that
                        // the user selected.
                        Uri uri = null;
                        if (resultData != null) {
                            uri = resultData.getData();
                            // Perform operations on the document using its URI.
                            try {
                                // get file content from edittext
                                String fileContent = exportString;
                                System.out.println("## data to write: " + exportString);
                                writeTextToUri(uri, fileContent);
                                writeToUiToast("file written to external shared storage: " + uri.toString());
                            } catch (IOException e) {
                                e.printStackTrace();
                                writeToUiToast("ERROR: " + e.toString());
                                return;
                            }
                        }
                    }
                }
            });

    private void writeTextToUri(Uri uri, String data) throws IOException {
        try {
            System.out.println("** data to write: " + data);
            OutputStreamWriter outputStreamWriter = new OutputStreamWriter(this.getContext().getContentResolver().openOutputStream(uri));
            outputStreamWriter.write(data);
            outputStreamWriter.close();
        } catch (IOException e) {
            System.out.println("Exception File write failed: " + e.toString());
        }
    }

    /**
     * options menu show licenses
     */

    // run: displayLicensesAlertDialog();
    // display licenses dialog see: https://bignerdranch.com/blog/open-source-licenses-and-android/
    private void displayLicensesAlertDialog() {
        WebView view = (WebView) LayoutInflater.from(this.getContext()).inflate(R.layout.dialog_licenses, null);
        view.loadUrl("file:///android_asset/open_source_licenses.html");
        android.app.AlertDialog mAlertDialog = new android.app.AlertDialog.Builder(this.getContext()).create();
        mAlertDialog = new android.app.AlertDialog.Builder(this.getContext(), R.style.Theme_TalkToYourCreditCard)
                .setTitle(getString(R.string.action_licenses))
                .setView(view)
                .setPositiveButton(android.R.string.ok, null)
                .show();
    }

    /**
     * section for OptionsMenu
     */

//    @Override
//    public boolean onCreateOptionsMenu(Menu menu) {
//        getMenuInflater().inflate(R.menu.menu_activity_main, menu);
//
//        MenuItem mCopyData = menu.findItem(R.id.action_copy_data);
//        mCopyData.setOnMenuItemClickListener(new MenuItem.OnMenuItemClickListener() {
//            @Override
//            public boolean onMenuItemClick(@NonNull MenuItem menuItem) {
//                ClipboardManager clipboard = (ClipboardManager)
//                        this.getActivity().getSystemService(Context.CLIPBOARD_SERVICE);
//                ClipData clip = ClipData.newPlainText("BasicNfcEmvReader", etLog.getText());
//                clipboard.setPrimaryClip(clip);
//                // show toast only on Android versions < 13
//                if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.S_V2)
//                    Toast.makeText(this.getCon, "copied", Toast.LENGTH_SHORT).show();
//                return false;
//            }
//        });
//
//        MenuItem mExportTextFile = menu.findItem(R.id.action_export_text_file);
//        mExportTextFile.setOnMenuItemClickListener(new MenuItem.OnMenuItemClickListener() {
//            @Override
//            public boolean onMenuItemClick(MenuItem item) {
//                Log.i(TAG, "mExportTextFile");
//                exportTextFile();
//                return false;
//            }
//        });
//
//        MenuItem mLicenses = menu.findItem(R.id.action_licenses);
//        mLicenses.setOnMenuItemClickListener(new MenuItem.OnMenuItemClickListener() {
//            @Override
//            public boolean onMenuItemClick(MenuItem item) {
//                Log.i(TAG, "mLicenses");
//                displayLicensesAlertDialog();
//                return false;
//            }
//        });
//
//        MenuItem mAbout = menu.findItem(R.id.action_about);
//        mAbout.setOnMenuItemClickListener(new MenuItem.OnMenuItemClickListener() {
//            @Override
//            public boolean onMenuItemClick(MenuItem item) {
//                Log.i(TAG, "mAbout");
//                View aboutPage = new AboutPage(context)
//                        .isRTL(false)
//                        .setDescription(getString(R.string.app_description))
//                        //.setCustomFont(String) // or Typeface
//                        .setImage(R.drawable.ic_launcher_playstore)
//                        .addItem(new Element().setTitle("Version 1.0"))
//                        .addGroup("Connect with us")
//                        .addEmail("androidcrypto@gmx.de")
//                        .addWebsite("https://medium.com/@androidcrypto")
//                        .addGitHub("androidcrypto")
//                        .addItem(getCopyRightsElement())
//                        .create();
//                setContentView(aboutPage);
//                return false;
//            }
//        });
//
//        return super.onCreateOptionsMenu(menu);
//    }
//
//    Element getCopyRightsElement() {
//        Element copyRightsElement = new Element();
//        final String copyrights = String.format(getString(R.string.copy_right), Calendar.getInstance().get(Calendar.YEAR));
//        copyRightsElement.setTitle(copyrights);
//        copyRightsElement.setIconDrawable(R.drawable.about_icon_copy_right);
//        copyRightsElement.setAutoApplyIconTint(true);
//        copyRightsElement.setIconTint(mehdi.sakout.aboutpage.R.color.about_item_icon_color);
//        copyRightsElement.setIconNightTint(android.R.color.white);
//        copyRightsElement.setGravity(Gravity.CENTER);
//        copyRightsElement.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View v) {
//                Toast.makeText(this.getClass()., copyrights, Toast.LENGTH_SHORT).show();
//            }
//        });
//        return copyRightsElement;
//    }
}