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

package com.visa.developer.viapsample.common;

import java.io.File;
import java.io.IOException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.util.Map;

import javax.net.ssl.SSLContext;

import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.ssl.SSLContexts;

import com.visa.developer.viapsample.utils.ConfigReader;

public class ApiClient {
	private ConfigReader config;
	private CloseableHttpClient httpClient;
	private HttpPost httpPost;
	private HttpPut httpPut;
	private HttpGet httpGet;
	private HttpDelete httpDelete;

	public ApiClient() throws KeyManagementException, UnrecoverableKeyException, NoSuchAlgorithmException, KeyStoreException, CertificateException, IOException {
		config = new ConfigReader();
		String proxyHostName = config.getProperty("PROXY_HOST_NAME");
		int proxyPortNumber = 0;
		try {
			proxyPortNumber = Integer.parseInt(config.getProperty("PROXY_PORT_NUMBER"));
		} catch (Exception e) {
			proxyPortNumber = 0;
		}
		if (config.getProperty("AUTHENTICATION_METHOD").equals("TWO_WAY_SSL")) {
			SSLContext sslcontext = SSLContexts.custom()
			        .loadKeyMaterial(new File(config.getProperty("KEY_STORE_PATH")),
			        		config.getProperty("KEY_STORE_PASSWORD").toCharArray(),
			        		config.getProperty("PRIVATE_KEY_PASSWORD").toCharArray())
			        .loadTrustMaterial(new File(config.getProperty("KEY_STORE_PATH")),
			        		config.getProperty("KEY_STORE_PASSWORD").toCharArray())
			        .build();

			SSLConnectionSocketFactory sslSocketFactory = new SSLConnectionSocketFactory(sslcontext, new String[] { "TLSv1.2" }, null,
			        SSLConnectionSocketFactory.getDefaultHostnameVerifier());
			
			httpClient = proxyHostName != null && proxyHostName != "" && proxyPortNumber != 0
	                		? HttpClients.custom().setProxy(new HttpHost(proxyHostName, proxyPortNumber)).setSSLSocketFactory(sslSocketFactory).build()
	                        : HttpClients.custom().setSSLSocketFactory(sslSocketFactory).build();
	                
		}
		else {
			httpClient = proxyHostName != null && proxyHostName != "" && proxyPortNumber != 0
	                		? HttpClients.custom().setProxy(new HttpHost(proxyHostName, proxyPortNumber)).build()
	                        : HttpClients.custom().build();
		}
	}
	
	public HttpResponse doPostWithJson(String url, String payload, Map<String, String> httpHeaders) throws ClientProtocolException, IOException  {
		httpPost = new HttpPost(url);
		StringEntity reqPayload = new StringEntity(payload);

		httpPost.setEntity(reqPayload);

		for (Map.Entry<String, String> entry : httpHeaders.entrySet()) {
			httpPost.addHeader(entry.getKey(), entry.getValue());
		}

		CloseableHttpResponse response = httpClient.execute(httpPost);

		return response;

	}

	public HttpResponse doPutWithJson(String url, String payload, Map<String, String> httpHeaders) throws IOException {
		httpPut = new HttpPut(url);
		StringEntity reqPayload = new StringEntity(payload);
		httpPut.setEntity(reqPayload);
		for (Map.Entry<String, String> entry : httpHeaders.entrySet()) {
			httpPut.addHeader(entry.getKey(), entry.getValue());
		}

		CloseableHttpResponse response = httpClient.execute(httpPut);

		return response;

	}

	public HttpResponse doGet(String url, Map<String, String> httpHeaders) throws  IOException {
		httpGet = new HttpGet(url);		
		for (Map.Entry<String, String> entry : httpHeaders.entrySet()) {
			httpGet.addHeader(entry.getKey(), entry.getValue());
		}

		CloseableHttpResponse response = httpClient.execute(httpGet);

		return response;

	}

	public HttpResponse doDelete(String url, Map<String, String> httpHeaders) throws  IOException {
		httpDelete = new HttpDelete(url);		
		for (Map.Entry<String, String> entry : httpHeaders.entrySet()) {
			httpDelete.addHeader(entry.getKey(), entry.getValue());
		}

		CloseableHttpResponse response = httpClient.execute(httpDelete);

		return response;

	}

	public CloseableHttpClient getHttpClient() {
		return httpClient;
	}

	public void setHttpClient(CloseableHttpClient httpClient) {
		this.httpClient = httpClient;
	}

	public HttpPost getHttpPost() {
		return httpPost;
	}

	public void setHttpPost(HttpPost httpPost) {
		this.httpPost = httpPost;
	}

	public HttpPut getHttpPut() {
		return httpPut;
	}

	public void setHttpPut(HttpPut httpPut) {
		this.httpPut = httpPut;
	}

	public HttpGet getHttpGet() {
		return httpGet;
	}

	public void setHttpGet(HttpGet httpGet) {
		this.httpGet = httpGet;
	}
}
