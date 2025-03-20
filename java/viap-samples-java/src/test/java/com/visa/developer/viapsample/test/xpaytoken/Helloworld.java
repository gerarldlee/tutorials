package com.visa.developer.viapsample.test.xpaytoken;

/*
 * (c) Copyright 2018 - 2020 Visa. All Rights Reserved.**
 *
 * NOTICE: The software and accompanying information and documentation (together, the “Software”) remain the property of and are proprietary to Visa and its suppliers and affiliates. The Software remains protected by intellectual property rights and may be covered by U.S. and foreign patents or patent applications. The Software is licensed and not sold.*
 *
 *  By accessing the Software you are agreeing to Visa's terms of use (developer.visa.com/terms) and privacy policy (developer.visa.com/privacy).In addition, all permissible uses of the Software must be in support of Visa products, programs and services provided through the Visa Developer Program (VDP) platform only (developer.visa.com). **THE SOFTWARE AND ANY ASSOCIATED INFORMATION OR DOCUMENTATION IS PROVIDED ON AN “AS IS,” “AS AVAILABLE,” “WITH ALL FAULTS” BASIS WITHOUT WARRANTY OR  CONDITION OF ANY KIND. YOUR USE IS AT YOUR OWN RISK.** All brand names are the property of their respective owners, used for identification purposes only, and do not imply product endorsement or affiliation with Visa. Any links to third party sites are for your information only and equally  do not constitute a Visa endorsement. Visa has no insight into and control over third party content and code and disclaims all liability for any such components, including continued availability and functionality. Benefits depend on implementation details and business factors and coding steps shown are exemplary only and do not reflect all necessary elements for the described capabilities. Capabilities and features are subject to Visa’s terms and conditions and may require development,implementation and resources by you based on your business and operational details. Please refer to the specific API documentation for details on the requirements, eligibility and geographic availability.*
 *
 * This Software includes programs, concepts and details under continuing development by Visa. Any Visa features,functionality, implementation, branding, and schedules may be amended, updated or canceled at Visa’s discretion.The timing of widespread availability of programs and functionality is also subject to a number of factors outside Visa’s control,including but not limited to deployment of necessary infrastructure by issuers, acquirers, merchants and mobile device manufacturers.*
 *
 */

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.SignatureException;

public class Helloworld {

    public static void main(String[] args) throws Exception {

        // THIS IS EXAMPLE ONLY how will apiKey and password look like
        // apiKey = "1WM2TT4IHPXC8DQ5I3CH21n1rEBGK-Eyv_oLdzE2VZpDqRn_U";
        // sharedSecret = "19JRVdej9";
        String apiKey = "2P3WJYLT4X0WTQ09KL0921sQTxwSMIxP-V4WaTz4xvQrM7iwc";
        String sharedSecret = "<YOUR SHARED SECRET>";

        String resourcePath = "helloworld";
        String queryString = "apiKey=" + apiKey;
        String requestBody = "";

        System.out.println("START Sample Code for Api Key-Shared Secret (X-Pay-Token)");
        URL url = new URL("https://sandbox.api.visa.com/vdp/helloworld?" + queryString);

        HttpURLConnection con = (HttpURLConnection) url.openConnection();

        con.setRequestMethod("GET");
        con.setRequestProperty("Content-Type", "application/json");
        con.setRequestProperty("Accept", "application/json");


        String xPayToken = generateXpaytoken(resourcePath, queryString, requestBody, sharedSecret);
        con.setRequestProperty("x-pay-token", xPayToken);

        int status = con.getResponseCode();
        System.out.println("Http Status: " + status);

        BufferedReader in;
        if (status == 200) {
            in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        } else {
            in = new BufferedReader(new InputStreamReader(con.getErrorStream()));
            System.out.println("Api Key-Shared Secret (X-Pay-Token) test failed");
        }
        String response;
        StringBuffer content = new StringBuffer();
        while ((response = in.readLine()) != null) {
            content.append(response);
        }
        in.close();
        con.disconnect();

        System.out.println(content.toString());
        System.out.println("END Sample Code for Api Key-Shared Secret (X-Pay-Token)");
    }

    public static String generateXpaytoken(String resourcePath, String queryString, String requestBody, String sharedSecret) throws SignatureException {
        String timestamp = timeStamp();
        String beforeHash = timestamp + resourcePath + queryString + requestBody;
        String hash = hmacSha256Digest(beforeHash, sharedSecret);
        String token = "xv2:" + timestamp + ":" + hash;
        return token;
    }

    private static String timeStamp() {
        return String.valueOf(System.currentTimeMillis() / 1000L);
    }

    private static String hmacSha256Digest(String data, String sharedSecret)
            throws SignatureException {
        return getDigest("HmacSHA256", sharedSecret, data, true);
    }

    private static String getDigest(String algorithm, String sharedSecret, String data, boolean toLower) throws SignatureException {
        try {
            Mac sha256HMAC = Mac.getInstance(algorithm);
            SecretKeySpec secretKey = new SecretKeySpec(sharedSecret.getBytes(StandardCharsets.UTF_8), algorithm);
            sha256HMAC.init(secretKey);

            byte[] hashByte = sha256HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String hashString = toHex(hashByte);

            return toLower ? hashString.toLowerCase() : hashString;
        } catch (Exception e) {
            throw new SignatureException(e);
        }
    }

    private static String toHex(byte[] bytes) {
        BigInteger bi = new BigInteger(1, bytes);
        return String.format("%0" + (bytes.length << 1) + "X", bi);
    }
}
