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

package com.visa.developer.viapsample.test.multiauth;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.Base64;

public class Helloworld {

    public static void main(String[] args) throws Exception {

        System.out.println("START Sample Code for Two-Way (Mutual) SSL");

        // either works!
        URL url = new URL("https://sandbox.api.visa.com/vdp/helloworld");

        // certification env
//        URL url = new URL("https://cert.api.visa.com/vdp/helloworld");

        // prod testing
//        URL url = new URL("https://api.visa.com/vdp/helloworld");


        HttpURLConnection con = (HttpURLConnection) url.openConnection();

        // THIS IS EXAMPLE ONLY how will cert and key look like
        // keystorePath = "visa.jks"
        // keystorePassword = "password"

        String keystorePath = "D:/Workspaces/IdeaProjects/viap-samples-java/src/test/resources/multiauth/fociiwallet_keyAndCertBundle.jks";
        String keystorePassword = "password";
        // Make a KeyStore from the PKCS-12 file
        KeyStore ks = KeyStore.getInstance("PKCS12");
        try (FileInputStream fis = new FileInputStream(keystorePath)) {
            ks.load(fis, keystorePassword.toCharArray());
        }

        // Make a KeyManagerFactory from the KeyStore
        KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
        kmf.init(ks, keystorePassword.toCharArray());

        // Now make an SSL Context with our Key Manager and the default Trust Manager
        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(kmf.getKeyManagers(), null, null);
        if (con instanceof HttpsURLConnection) {
            ((HttpsURLConnection) con).setSSLSocketFactory(sslContext.getSocketFactory());
        }

        con.setRequestMethod("GET");
        con.setRequestProperty("Content-Type", "application/json");
        con.setRequestProperty("Accept", "application/json");

        // THIS IS EXAMPLE ONLY how will user_id and password look like
        // userId = "1WM2TT4IHPXC8DQ5I3CH21n1rEBGK-Eyv_oLdzE2VZpDqRn_U";
        // password = "19JRVdej9";
        String userId = "TYW01T1TMML6VIZ75M9H21q4H2p6fZl_mwRuaOilb6UIXpLiY";
        String password = "8FTvkU2BII6B889YFr1mZWvA1vczETMVz1NgsA";

        String auth = userId + ":" + password;
        byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes(StandardCharsets.UTF_8));
        String authHeaderValue = "Basic " + new String(encodedAuth);
        con.setRequestProperty("Authorization", authHeaderValue);

        int status = con.getResponseCode();
        System.out.println("Http Status: " + status);

        BufferedReader in;
        if (status == 200) {
            in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        } else {
            in = new BufferedReader(new InputStreamReader(con.getErrorStream()));
            System.out.println("Two-Way (Mutual) SSL test failed");
        }
        String response;
        StringBuffer content = new StringBuffer();
        while ((response = in.readLine()) != null) {
            content.append(response);
        }
        in.close();
        con.disconnect();

        System.out.println(content.toString());
        System.out.println("END Sample Code for Two-Way (Mutual) SSL");
    }
}
