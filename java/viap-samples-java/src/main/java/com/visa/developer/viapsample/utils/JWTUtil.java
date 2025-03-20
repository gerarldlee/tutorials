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

import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.nimbusds.jose.EncryptionMethod;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWEAlgorithm;
import com.nimbusds.jose.JWEHeader;
import com.nimbusds.jose.JWEObject;
import com.nimbusds.jose.crypto.AESEncrypter;
import com.nimbusds.jose.crypto.RSAEncrypter;


public class JWTUtil {
	public static String jweEncryptWithCert(String data, String rsaPublicKey, String kid) throws JOSEException, NoSuchAlgorithmException, InvalidKeySpecException {
		RSAPublicKey rsaPubKey = fetchingOfPublicKeyFromGivenInput(rsaPublicKey);
        long currentTime = (new Date()).getTime() / 1000L;
        Map<String, Object> customParams = new HashMap<String, Object>();
        customParams.put("iat",currentTime);
        JWEHeader updatedHeader = (new JWEHeader.Builder(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM))
                .keyID(kid).type(JOSEObjectType.JOSE).customParams(customParams).build();
        JWEObject jweObject = new JWEObject(updatedHeader, new com.nimbusds.jose.Payload(data));
        RSAEncrypter encrypter = new RSAEncrypter(rsaPubKey);
        jweObject.encrypt(encrypter);
        return jweObject.serialize();
    }
	
    private static RSAPublicKey fetchingOfPublicKeyFromGivenInput(String rsaPublicKey)
            throws NoSuchAlgorithmException, InvalidKeySpecException  {
        RSAPublicKey rsaPubKey = null;
        String publicKeyPEM = null;
        if (null!=rsaPublicKey && !rsaPublicKey.equals("")) {
            if (rsaPublicKey.startsWith("-----BEGIN")) {
                publicKeyPEM = rsaPublicKey.replace("-----BEGIN CERTIFICATE-----", "");
                publicKeyPEM = publicKeyPEM.replace("-----END CERTIFICATE-----", "");
                rsaPublicKey = publicKeyPEM;
            }
            byte[] publicKeyalue = getPublicKey(convertStringToX509Cert(rsaPublicKey.trim())); 
            rsaPubKey = (RSAPublicKey) KeyFactory.getInstance("RSA")
                    .generatePublic(new X509EncodedKeySpec(publicKeyalue));

        }
        return rsaPubKey;
    }
    
    private static X509Certificate convertStringToX509Cert(String certificate) {
		CertificateFactory cfb = null;
		InputStream bisb = null;
		X509Certificate certb = null;
		String beginCertificate = "-----BEGIN CERTIFICATE-----";
		String endCertificate = "-----END CERTIFICATE-----";
		if ((!certificate.contains(beginCertificate)) && (!certificate.startsWith("-"))) {
			certificate = beginCertificate + "\n" + certificate;
		}
		if ((!certificate.contains(endCertificate)) && (!certificate.endsWith("-"))) {
			certificate = certificate + "\n" + endCertificate;
		}
		byte[] strCert = certificate.getBytes(StandardCharsets.UTF_8);
		try {
			cfb = CertificateFactory.getInstance("X509");
			bisb = new ByteArrayInputStream(strCert);
			certb = (X509Certificate) cfb.generateCertificate(bisb);
		} catch (CertificateException e) {
			System.out.println("CertificateException::[{}]" + e.getMessage());
		}
		try {
			if (bisb != null) {
				bisb.close();
			}
		} catch (IOException e) {
			System.out.println("IOException::[{}]" + e.getMessage());
		}
		return certb;
	}
    
    private static byte[] getPublicKey(X509Certificate certificate) {
		if ((certificate != null) && (certificate.getPublicKey() != null)) {
			return certificate.getPublicKey().getEncoded();
		}
		return new byte[0];
	}
    
    public static String jweEncryptWithSS(String data, String sharedSecret, String kid) throws JOSEException, NoSuchAlgorithmException, InvalidKeySpecException {
        long currentTime = (new Date()).getTime() / 1000L;
        Map<String, Object> customParams = new HashMap<String, Object>();
        customParams.put("iat", currentTime);
        JWEHeader updatedHeader = (new JWEHeader.Builder(JWEAlgorithm.A256GCMKW, EncryptionMethod.A256GCM))
                .keyID(kid).type(JOSEObjectType.JOSE)
                .customParams(customParams)
                .build();
        JWEObject jweObject = new JWEObject(updatedHeader, new com.nimbusds.jose.Payload(data));
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(sharedSecret.getBytes(StandardCharsets.UTF_8));
        System.out.println(hash);
        AESEncrypter encrypter = new AESEncrypter(hash);
        jweObject.encrypt(encrypter);
        return jweObject.serialize();
    }
}
