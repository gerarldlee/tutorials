package com.visa.developer.viapsample.utils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;

import com.nimbusds.jose.JOSEException;

public class EncryptionUtility {
	ConfigReader config;
	public EncryptionUtility() {
		config = new ConfigReader();
	}
	
	public String encryptField(String field) throws NoSuchAlgorithmException, InvalidKeySpecException, JOSEException, IOException {
		String encryptionKid = config.getProperty("ENCRYPTION_KID");
		if (config.getProperty("ENCRYPTION_METHOD").equals("ASYMMETRIC")) {
			String publicKeyLocation = config.getProperty("ENCRYPTION_PUBLIC_KEY_PATH");
			String publicKey = new String(Files.readAllBytes(Paths.get(publicKeyLocation)));
			return JWTUtil.jweEncryptWithCert(field, publicKey, encryptionKid);
		}
		else if (config.getProperty("ENCRYPTION_METHOD").equals("SYMMETRIC")) {
			String sharedSecret = config.getProperty("ENCRYPTION_SHARED_SECRET");
			return JWTUtil.jweEncryptWithSS(field, sharedSecret, encryptionKid);
		}
		return "";
	}

}
