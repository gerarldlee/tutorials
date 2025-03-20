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

package com.visa.developer.viapsample.test;

import java.io.IOException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.security.spec.InvalidKeySpecException;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.Test;
import org.junit.FixMethodOrder;
import org.junit.runners.MethodSorters;

import com.nimbusds.jose.JOSEException;
import com.visa.developer.viapsample.api.CardManagement;
import com.visa.developer.viapsample.api.Provisioning;
import com.visa.developer.viapsample.utils.EncryptionUtility;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class TestViap {
	CardManagement cardManagement;
	Provisioning provisioning;
	EncryptionUtility encryptor;
	private static String vCardID;
	
	public TestViap() throws KeyManagementException, UnrecoverableKeyException, NoSuchAlgorithmException, KeyStoreException, CertificateException, IOException {
		cardManagement = new CardManagement();
		provisioning = new Provisioning();
		encryptor = new EncryptionUtility();
	}
	
	// Provisioning APIs test
	@Test
	public void test01a_enrollCard() throws SignatureException, ClientProtocolException, IOException, NoSuchAlgorithmException, InvalidKeySpecException, JOSEException {
		System.out.println("---Testing Card Management Enroll Card---");
		
		String card = "{" + 
							"\"accountNumber\": \"accountNumber_placeholder\"," + 
							"\"cvv2\": \"cvv2_placeholder\"," + 
							"\"nameOnCard\": \"nameOnCard_placeholder\"," + 
							"\"expirationDate\": {" +
								"\"month\":\"month_placeholder\"," + 
								"\"year\":\"year_placeholder\"" +
								"}," +
							"\"billingAddress\": {" +
								"\"name\":\"name_placeholder\"," +
								"\"line1\":\"line1_placeholder\"," + 
								"\"line2\":\"line2_placeholder\"," +
								"\"line3\":\"line3_placeholder\"," +
								"\"city\":\"city_placeholder\"," +
								"\"state\":\"state_placeholder\"," +
								"\"postalCode\":\"postalCode_placeholder\"," +
								"\"countryCode\":\"countryCode_placeholder\"" +
								"}" +
						"}";
		String encCard = encryptor.encryptField(card);
		
		String payload = "{" +
				"\"encCard\":\"" + encCard + "\"" +
		//		"\"vCardID\":\"" + vCardID_placeholder + "\"" +			// Conditional - Either encCard or vCardID
			"}";
		
		HttpResponse httpResponse = cardManagement.enrollCard(payload);
		System.out.println("------------------------");
		System.out.println("Response Status:");
		System.out.println(httpResponse.getStatusLine());
		System.out.println("Correlation ID:");
		System.out.println(httpResponse.getFirstHeader("X-CORRELATION-ID").getValue());
		HttpEntity entity = httpResponse.getEntity();
		if (httpResponse.getEntity() != null) {
			String responseBody = EntityUtils.toString(entity);
			System.out.println("Response Body:");
			System.out.println(responseBody);
			JSONObject response = new JSONObject(responseBody);
			if (response.has("vCardID")) {
				vCardID = response.getString("vCardID");
			}
		}
		System.out.println("Card enrolled with ID: " + vCardID);
		System.out.println("-------------------------------------------------");
		Assert.assertEquals(201, httpResponse.getStatusLine().getStatusCode());
	}
	
	@Test
	public void test01b_getCard() throws IOException, SignatureException {
		System.out.println("---Testing Card Management Get    Card---");
		
		HttpResponse httpResponse = cardManagement.getCard(vCardID);
		System.out.println("------------------------");
		System.out.println("Response Status:");
		System.out.println(httpResponse.getStatusLine());
		System.out.println("Correlation ID:");
		System.out.println(httpResponse.getFirstHeader("X-CORRELATION-ID").getValue());
		HttpEntity entity = httpResponse.getEntity();
		if (httpResponse.getEntity() != null) {
			String responseBody = EntityUtils.toString(entity);
			System.out.println("Response Body:");
			System.out.println(responseBody);
		}
		System.out.println("-------------------------------------------------");
		Assert.assertEquals(200, httpResponse.getStatusLine().getStatusCode());
	}
	
	
	@Test
	public void test01c_ApplePayProvisioning() throws SignatureException, ClientProtocolException, IOException {
		System.out.println("---Testing In-App Provisioning for Apple Pay---");
		
		String payload = "{" +
							"\"vCardID\":\"" + vCardID + "\"," +
							"\"deviceCert\": \"deviceCert_placeholder\"," + 
							"\"nonce\": \"nonce_placeholder\"," + 
							"\"nonceSignature\": \"nonceSignature_placeholder\"" + 
//							",\"tokenServiceProvider\":\"V\"" +				// Optional
						"}";
		
		HttpResponse httpResponse = provisioning.applePay(payload);
		System.out.println("------------------------");
		System.out.println("Response Status:");
		System.out.println(httpResponse.getStatusLine());
		System.out.println("Correlation ID:");
		System.out.println(httpResponse.getFirstHeader("X-CORRELATION-ID").getValue());
		if (httpResponse.getEntity() != null) {
			HttpEntity entity = httpResponse.getEntity();
			String responseBody = EntityUtils.toString(entity);
			System.out.println("Response Body:");
			System.out.println(responseBody);
		}
		System.out.println("-------------------------------------------------");
		Assert.assertEquals(200, httpResponse.getStatusLine().getStatusCode());
	}
	
	@Test
	public void test01d_GooglePayProvisioning() throws SignatureException, ClientProtocolException, IOException {
		System.out.println("---Testing In-App Provisioning for Google Pay---");
		
		String payload = "{" +
				"\"vCardID\":\"" + vCardID + "\"," +
				"\"deviceID\":\"deviceID_placeholder\"," + 
				"\"clientCustomerID\": \"clientCustomerID_placeholder\"" +
//				",\"tokenServiceProvider\":\"V\"" +				// Optional
			"}";
		
		HttpResponse httpResponse = provisioning.googlePay(payload);
		System.out.println("------------------------");
		System.out.println("Response Status:");
		System.out.println(httpResponse.getStatusLine());
		System.out.println("Correlation ID:");
		System.out.println(httpResponse.getFirstHeader("X-CORRELATION-ID").getValue());
		if (httpResponse.getEntity() != null) {
			HttpEntity entity = httpResponse.getEntity();
			String responseBody = EntityUtils.toString(entity);
			System.out.println("Response Body:");
			System.out.println(responseBody);
		}
		System.out.println("-------------------------------------------------");
		Assert.assertEquals(200, httpResponse.getStatusLine().getStatusCode());
	}
	
	@Test
	public void test01e_SamsungPayProvisoioning() throws SignatureException, ClientProtocolException, IOException {
		System.out.println("---Testing In-App Provisioning for Samsung Pay---");
		
		String payload = "{" +
				"\"vCardID\":\"" + vCardID + "\"," +
				"\"deviceID\":\"deviceID_placeholder\"," + 
				"\"clientCustomerID\": \"clientCustomerID_placeholder\"" +
//				",\"tokenServiceProvider\":\"V\"" +				// Optional
			"}";
		
		HttpResponse httpResponse = provisioning.samsungPay(payload);
		System.out.println("------------------------");
		System.out.println("Response Status:");
		System.out.println(httpResponse.getStatusLine());
		System.out.println("Correlation ID:");
		System.out.println(httpResponse.getFirstHeader("X-CORRELATION-ID").getValue());
		if (httpResponse.getEntity() != null) {
			HttpEntity entity = httpResponse.getEntity();
			String responseBody = EntityUtils.toString(entity);
			System.out.println("Response Body:");
			System.out.println(responseBody);
		}
		System.out.println("-------------------------------------------------");
		Assert.assertEquals(200, httpResponse.getStatusLine().getStatusCode());
	}
	
	@Test
	public void test01f_deleteCard() throws IOException, SignatureException {
		System.out.println("---Testing Card Management Delete Card---");
		
		HttpResponse httpResponse = cardManagement.deleteCard(vCardID);
		System.out.println("------------------------");
		System.out.println("Response Status:");
		System.out.println(httpResponse.getStatusLine());
		System.out.println("Correlation ID:");
		System.out.println(httpResponse.getFirstHeader("X-CORRELATION-ID").getValue());
		HttpEntity entity = httpResponse.getEntity();
		if (httpResponse.getEntity() != null) {
			String responseBody = EntityUtils.toString(entity);
			System.out.println("Response Body:");
			System.out.println(responseBody);
		}
		System.out.println("-------------------------------------------------");
		Assert.assertEquals(204, httpResponse.getStatusLine().getStatusCode());
	}
}
