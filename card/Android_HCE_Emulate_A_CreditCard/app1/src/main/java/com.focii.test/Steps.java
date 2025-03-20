package com.focii.test;

import static com.focii.test.Utils.bytesToHexBlankNpe;
import static com.focii.test.Utils.bytesToHexNpe;
import static com.focii.test.Utils.hexToBytes;
import static com.focii.test.Utils.intToByteArray;

import androidx.annotation.NonNull;

import com.github.devnied.emvnfccard.iso7816emv.TagAndLength;
import com.github.devnied.emvnfccard.utils.TlvUtil;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

import com.focii.test.DolValues;

public class Steps {
    /**
     * step 1 code start
     */

    /**
     * build a select apdu command
     *
     * @param data
     * @return
     */
    public byte[] selectApdu(@NonNull byte[] data) {
        byte[] commandApdu = new byte[6 + data.length];
        commandApdu[0] = (byte) 0x00;  // CLA
        commandApdu[1] = (byte) 0xA4;  // INS
        commandApdu[2] = (byte) 0x04;  // P1
        commandApdu[3] = (byte) 0x00;  // P2
        commandApdu[4] = (byte) (data.length & 0x0FF);       // Lc
        System.arraycopy(data, 0, commandApdu, 5, data.length);
        commandApdu[commandApdu.length - 1] = (byte) 0x00;  // Le
        return commandApdu;
    }

    /**
     * step 1 code end
     */

    /**
     * step 4 code start
     */

    /**
     * construct the getProcessingOptions command using the provided pdol
     * the default ttq is null, but another ttq can used if default ttq gives no result for later sending
     * @param pdol
     * @param alternativeTtq
     * @return a byte[][] array
     * [0] = getProcessingOptions command
     * [1] = text table with requested tags from pdol with length and value
     */
    public byte[][] getGpoFromPdolExtended(@NonNull byte[] pdol, byte[] alternativeTtq) {

        byte[][] result = new byte[2][];
        // get the tags in a list
        List<TagAndLength> tagAndLength = TlvUtil.parseTagAndLength(pdol);
        int tagAndLengthSize = tagAndLength.size();
        StringBuilder returnString = new StringBuilder();
        returnString.append("The card is requesting " + tagAndLengthSize + (tagAndLengthSize == 1 ? " tag" : " tags")).append(" in the PDOL").append("\n");
        returnString.append("\n");
        returnString.append("Tag  Tag Name                        Length Value").append("\n");
        returnString.append("-----------------------------------------------------").append("\n");
        if (tagAndLengthSize < 1) {
            returnString.append("     no PDOL provided, returning an empty command").append("\n");
            returnString.append("-----------------------------------------------------");
            // there are no pdols in the list
            //Log.e(TAG, "there are no PDOLs in the pdol array, aborted");
            //return null;
            // returning an empty PDOL
            String tagLength2d = "00"; // length value
            String tagLength2dAnd2 = "02"; // length value + 2
            String constructedGpoCommandString = "80A80000" + tagLength2dAnd2 + "83" + tagLength2d + "" + "00";
            result[0] = hexToBytes(constructedGpoCommandString);
            result[1] = returnString.toString().getBytes(StandardCharsets.UTF_8);
            return result;
            //return hexToBytes(constructedGpoCommandString);
        }
        int valueOfTagSum = 0; // total length
        StringBuilder sb = new StringBuilder(); // takes the default values of the tags
        DolValues dolValues = new DolValues();
        for (int i = 0; i < tagAndLengthSize; i++) {
            // get a single tag
            TagAndLength tal = tagAndLength.get(i); // eg 9f3704
            byte[] tagToSearch = tal.getTag().getTagBytes(); // gives the tag 9f37
            int lengthOfTag = tal.getLength(); // 4
            String nameOfTag = tal.getTag().getName();
            valueOfTagSum += tal.getLength(); // add it to the sum
            // now we are trying to find a default value
            byte[] defaultValue = dolValues.getDolValue(tagToSearch, alternativeTtq);
            byte[] usedValue = new byte[0];
            if (defaultValue != null) {
                if (defaultValue.length > lengthOfTag) {
                    // cut it to correct length
                    usedValue = Arrays.copyOfRange(defaultValue, 0, lengthOfTag);
                    //Log.i(TAG, "asked for tag: " + bytesToHexNpe(tal.getTag().getTagBytes()) + " default is too long, cut to: " + bytesToHexNpe(usedValue));
                } else if (defaultValue.length < lengthOfTag) {
                    // increase length
                    usedValue = new byte[lengthOfTag];
                    System.arraycopy(defaultValue, 0, usedValue, 0, defaultValue.length);
                    //Log.i(TAG, "asked for tag: " + bytesToHexNpe(tal.getTag().getTagBytes()) + " default is too short, increased to: " + bytesToHexNpe(usedValue));
                } else {
                    // correct length
                    usedValue = defaultValue.clone();
                    //Log.i(TAG, "asked for tag: " + bytesToHexNpe(tal.getTag().getTagBytes()) + " default found: " + bytesToHexNpe(usedValue));
                }
            } else {
                // defaultValue is null means the tag was not found in our tags database for default values
                usedValue = new byte[lengthOfTag];
                //Log.i(TAG, "asked for tag: " + bytesToHexNpe(tal.getTag().getTagBytes()) + " NO default found, generate zeroed: " + bytesToHexNpe(usedValue));
            }
            // now usedValue does have the correct length
            sb.append(bytesToHexNpe(usedValue));
            returnString.append(trimStringRight(bytesToHexNpe(tagToSearch),5)).append(trimStringRight(nameOfTag, 36))
                    .append(trimStringRight(String.valueOf(lengthOfTag), 3)).append(bytesToHexBlankNpe(usedValue)).append("\n");
        }
        returnString.append("-----------------------------------------------------").append("\n");
        String constructedGpoString = sb.toString();
        String tagLength2d = bytesToHexNpe(intToByteArray(valueOfTagSum)); // length value
        String tagLength2dAnd2 = bytesToHexNpe(intToByteArray(valueOfTagSum + 2)); // length value + 2
        String constructedGpoCommandString = "80A80000" + tagLength2dAnd2 + "83" + tagLength2d + constructedGpoString + "00";
        result[0] = hexToBytes(constructedGpoCommandString);
        result[1] = returnString.toString().getBytes(StandardCharsets.UTF_8);
        return result;
    }

    /**
     * step 4 code end
     */

    /**
     * step 7 code start
     */

    public String getPanFromTrack2EquivalentData(byte[] track2Data) {
        if (track2Data != null) {
            String track2DataString = bytesToHexNpe(track2Data);
            int posSeparator = track2DataString.toUpperCase().indexOf("D");
            return removeTrailingF(track2DataString.substring(0, posSeparator));
        } else {
            return "";
        }
    }

    public String getExpirationDateFromTrack2EquivalentData(byte[] track2Data) {
        if (track2Data != null) {
            String track2DataString = bytesToHexNpe(track2Data);
            int posSeparator = track2DataString.toUpperCase().indexOf("D");
            return track2DataString.substring((posSeparator + 1), (posSeparator + 5));
        } else {
            return "";
        }
    }

    /**
     * remove all trailing 0xF's trailing in the 16 byte length field tag 0x5a = PAN and in Track2EquivalentData
     * PAN is padded with 'F' if not of length 16
     *
     * @param input
     * @return
     */
    public String removeTrailingF(String input) {
        int index;
        for (index = input.length() - 1; index >= 0; index--) {
            if (input.charAt(index) != 'f') {
                break;
            }
        }
        return input.substring(0, index + 1);
    }

    /**
     * step 7 code end
     */

    /**
     * add blanks to a string on right side up to a length of len
     * if the data.length >= len one character is deleted to get minimum one blank
     *
     * @param data
     * @param len
     * @return
     */
    public String trimStringRight(String data, int len) {
        if (data.length() >= len) {
            data = data.substring(0, (len - 1));
        }
        while (data.length() < len) {
            data = data + " ";
        }
        return data;
    }

    /**
     * checks if the response has an 0x'9000' at the end means success
     * and the method returns the data without 0x'9000' at the end
     * if any other trailing bytes show up the method returns NULL
     *
     * @param data
     * @return
     */
    public byte[] checkResponse(@NonNull byte[] data) {
        // simple sanity check
        if (data.length < 5) {
            return null;
        } // not ok
        int status = ((0xff & data[data.length - 2]) << 8) | (0xff & data[data.length - 1]);
        if (status != 0x9000) {
            return null;
        } else {
            return Arrays.copyOfRange(data, 0, data.length - 2);
        }
    }
}
