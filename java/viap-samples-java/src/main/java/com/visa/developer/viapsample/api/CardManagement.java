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

package com.visa.developer.viapsample.api;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.util.HashMap;
import java.util.Map;

import org.apache.http.HttpResponse;
import org.springframework.util.Base64Utils;
import org.apache.http.client.ClientProtocolException;

import com.visa.developer.viapsample.common.ApiClient;
import com.visa.developer.viapsample.utils.ConfigReader;
import com.visa.developer.viapsample.utils.XPayTokenGenerator;

public class CardManagement {
	ApiClient apiClient;
	ConfigReader configReader;
	
	public CardManagement() throws KeyManagementException, UnrecoverableKeyException, NoSuchAlgorithmException, KeyStoreException, CertificateException, IOException {
		apiClient = new ApiClient();
		configReader = new ConfigReader();
	}

	public HttpResponse enrollCard(String payload) throws SignatureException, ClientProtocolException, IOException {
		String host = configReader.getProperty("HOST");
		String baseUri = "universal/";
		String resourcePath = "core/cards";
		Map<String, String> httpHeaders = new HashMap<String, String>();

		String url = "";
		if (configReader.getProperty("AUTHENTICATION_METHOD").equals("X_PAY_TOKEN")) {
			String apiKey = configReader.getProperty("APIKEY");
			String sharedSecret = configReader.getProperty("SHARED_SECRET");
			String queryString = "apikey=" + apiKey;
			
			url = host + baseUri + resourcePath + '?' + queryString;
			
			httpHeaders.put("x-pay-token", XPayTokenGenerator.generateXPayToken(resourcePath, queryString, payload, sharedSecret));
		}
		else if (configReader.getProperty("AUTHENTICATION_METHOD").equals("TWO_WAY_SSL")) {
			url = host + baseUri + resourcePath;
			
			String credentials = configReader.getProperty("USERNAME") + ":" + configReader.getProperty("PASSWORD");
			String encodedCredentials = Base64Utils.encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
			httpHeaders.put("Authorization", "Basic " + encodedCredentials);
		
		}
		httpHeaders.put("Content-Type", "application/json");
		
		System.out.println("Request URL:");
		System.out.println(url);
		System.out.println("Request Headers:");
		System.out.println(httpHeaders.toString());
		System.out.println("Request Body:");
		System.out.println(payload);
		
		HttpResponse httpResponse = apiClient.doPostWithJson(url, payload, httpHeaders);
		return httpResponse;
	}

	public HttpResponse getCard(String vCardID) throws SignatureException, ClientProtocolException, IOException {
		String host = configReader.getProperty("HOST");
		String baseUri = "universal/";
		String resourcePath = "core/cards/" + vCardID;

		Map<String, String> httpHeaders = new HashMap<String, String>();

		String url = "";
		String payload = "";
		if (configReader.getProperty("AUTHENTICATION_METHOD").equals("X_PAY_TOKEN")) {
			String apiKey = configReader.getProperty("APIKEY");
			String sharedSecret = configReader.getProperty("SHARED_SECRET");
			String queryString = "apikey=" + apiKey;
			
			url = host + baseUri + resourcePath + '?' + queryString;
			
			httpHeaders.put("x-pay-token", XPayTokenGenerator.generateXPayToken(resourcePath, queryString, payload, sharedSecret));
		}
		else if (configReader.getProperty("AUTHENTICATION_METHOD").equals("TWO_WAY_SSL")) {
			url = host + baseUri + resourcePath;
			
			String credentials = configReader.getProperty("USERNAME") + ":" + configReader.getProperty("PASSWORD");
			String encodedCredentials = Base64Utils.encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
			httpHeaders.put("Authorization", "Basic " + encodedCredentials);
		
		}
		httpHeaders.put("Content-Type", "application/json");
		
		System.out.println("Request URL:");
		System.out.println(url);
		System.out.println("Request Headers:");
		System.out.println(httpHeaders.toString());
		
		HttpResponse httpResponse = apiClient.doGet(url, httpHeaders);
		return httpResponse;
	}

	public HttpResponse deleteCard(String vCardID) throws SignatureException, ClientProtocolException, IOException {
		String host = configReader.getProperty("HOST");
		String baseUri = "universal/";
		String resourcePath = "core/cards/" + vCardID;

		Map<String, String> httpHeaders = new HashMap<String, String>();

		String url = "";
		String payload = "";
		if (configReader.getProperty("AUTHENTICATION_METHOD").equals("X_PAY_TOKEN")) {
			String apiKey = configReader.getProperty("APIKEY");
			String sharedSecret = configReader.getProperty("SHARED_SECRET");
			String queryString = "apikey=" + apiKey;
			
			url = host + baseUri + resourcePath + '?' + queryString;
			
			httpHeaders.put("x-pay-token", XPayTokenGenerator.generateXPayToken(resourcePath, queryString, payload, sharedSecret));
		}
		else if (configReader.getProperty("AUTHENTICATION_METHOD").equals("TWO_WAY_SSL")) {
			url = host + baseUri + resourcePath;
			
			String credentials = configReader.getProperty("USERNAME") + ":" + configReader.getProperty("PASSWORD");
			String encodedCredentials = Base64Utils.encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
			httpHeaders.put("Authorization", "Basic " + encodedCredentials);
		
		}
		httpHeaders.put("Content-Type", "application/json");
		
		System.out.println("Request URL:");
		System.out.println(url);
		System.out.println("Request Headers:");
		System.out.println(httpHeaders.toString());
		
		HttpResponse httpResponse = apiClient.doDelete(url, httpHeaders);
		return httpResponse;
	}
}
