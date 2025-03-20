/*
##License
**© Copyright 2018 - 2021 Visa. All Rights Reserved.**

*NOTICE: The software and accompanying information and documentation (together, the "Software") remain the property of
and are proprietary to Visa and its suppliers and affiliates. The Software remains protected by intellectual property
rights and may be covered by U.S. and foreign patents or patent applications. The Software is licensed and not sold.*

*By accessing the Software you are agreeing to Visa's terms of use (developer.visa.com/terms) and privacy policy (developer.visa.com/privacy).
In addition, all permissible uses of the Software must be in support of Visa products, programs and services provided
through the Visa Developer Program (VDP) platform only (developer.visa.com) and are limited to non-production use
for purposes of sandbox testing only.

**THE SOFTWARE AND ANY ASSOCIATED INFORMATION OR DOCUMENTATION IS PROVIDED ON AN "AS IS," "AS AVAILABLE," "WITH ALL FAULTS" BASIS
WITHOUT WARRANTY OR CONDITION OF ANY KIND. YOUR USE IS AT YOUR OWN RISK AND VISA DISCLAIMS ANY AND ALL LIABILITY WHATSOEVER.**
All brand names are the property of their respective owners, used for identification purposes only, and do not imply product endorsement or
affiliation with Visa. Any links to third party sites are for your information only and equally do not constitute a Visa endorsement.
Visa has no insight into and control over third party content and code and disclaims all liability for any such components,
including continued availability and functionality. Benefits depend on implementation details and business factors and
coding steps shown are exemplary only and do not reflect all necessary elements for the described capabilities. Capabilities and
features are subject to Visa’s terms and conditions and may require development, implementation and resources by you based on your business and
operational details. Please refer to the specific API documentation for details on the requirements, eligibility and geographic availability.*

*This Software includes programs, concepts and details under continuing development by Visa. Any Visa features, functionality,
implementation, branding, and schedules may be amended, updated or canceled at Visa’s discretion. The timing of widespread availability
of programs and functionality is also subject to a number of factors outside Visa’s control, including but not limited to deployment
of necessary infrastructure by issuers, acquirers, merchants and mobile device manufacturers.*
*
*##Note
This sample code is licensed only for use in a non-production environment for sandbox testing. See the license for all terms of use.
*/

package com.visa.developer.viapsample.utils;

import java.nio.charset.StandardCharsets;
import java.security.SignatureException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Hex;

public class XPayTokenGenerator {
	public static String generateXPayToken(String resourcePath, String queryString, String payload, String sharedSecret) throws SignatureException {
        String timestamp = timeStamp();
        String beforeHash = timestamp + resourcePath + queryString + payload;
        String hash = hmacSha256Digest(beforeHash.trim(),sharedSecret);
        String token = "xv2:" + timestamp + ":" + hash;
        return token;
	}
	
    private static String timeStamp() {
        return String.valueOf(System.currentTimeMillis()/ 1000L);
    }

    private static String hmacSha256Digest(String data,String shredScretKey)
            throws SignatureException {
        return getDigest("HmacSHA256", shredScretKey, data, true);
    }


    private static String getDigest(String algorithm, String sharedSecret, String data,
            boolean toLower) throws SignatureException {
        try {
            Mac sha256HMAC = Mac.getInstance(algorithm);
            SecretKeySpec secretKey = new SecretKeySpec(sharedSecret.getBytes(StandardCharsets.UTF_8), algorithm);
            sha256HMAC.init(secretKey);

            byte[] hashByte = sha256HMAC.doFinal(data.getBytes("UTF-8"));
           	String token = Hex.encodeHexString(hashByte);
            return token;
        } catch (Exception e) {
            throw new SignatureException(e);
        }
    }
}
