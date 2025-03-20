##License
**© Copyright 2018 - 2021 Visa. All Rights Reserved.**

*NOTICE: The software and accompanying information and documentation (together, the "Software") remain the property of and are proprietary to Visa and its suppliers and affiliates. The Software remains protected by intellectual property rights and may be covered by U.S. and foreign patents or patent applications. The Software is licensed and not sold.*

*By accessing the Software you are agreeing to Visa's terms of use (developer.visa.com/terms) and privacy policy (developer.visa.com/privacy).In addition, all permissible uses of the Software must be in support of Visa products, programs and services provided through the Visa Developer Program (VDP) platform only (developer.visa.com) and are limited to non-production use for purposes of sandbox testing only. **THE SOFTWARE AND ANY ASSOCIATED INFORMATION OR DOCUMENTATION IS PROVIDED ON AN "AS IS," "AS AVAILABLE," "WITH ALL FAULTS" BASIS WITHOUT WARRANTY OR CONDITION OF ANY KIND. YOUR USE IS AT YOUR OWN RISK AND VISA DISCLAIMS ANY AND ALL LIABILITY WHATSOEVER.** All brand names are the property of their respective owners, used for identification purposes only, and do not imply product endorsement or affiliation with Visa. Any links to third party sites are for your information only and equally do not constitute a Visa endorsement. Visa has no insight into and control over third party content and code and disclaims all liability for any such components, including continued availability and functionality. Benefits depend on implementation details and business factors and coding steps shown are exemplary only and do not reflect all necessary elements for the described capabilities. Capabilities and features are subject to Visa’s terms and conditions and may require development, implementation and resources by you based on your business and operational details. Please refer to the specific API documentation for details on the requirements, eligibility and geographic availability.*

*This Software includes programs, concepts and details under continuing development by Visa. Any Visa features, functionality, implementation, branding, and schedules may be amended, updated or canceled at Visa’s discretion. The timing of widespread availability of programs and functionality is also subject to a number of factors outside Visa’s control, including but not limited to deployment of necessary infrastructure by issuers, acquirers, merchants and mobile device manufacturers.*




##Note
This sample code is licensed only for use in a non-production environment for sandbox testing. See the license for all terms of use.

# In-App Provisioning APIs

<b>Note:</b> Visa In-App Provisioning APIs can help allow clients to perform digital credential operations such as pushing the credentials to pay wallets and enrolling the card universally in Visa. All these APIs are RESTful, so it uses HTTP Methods POST, PUT, GET and DELETE to perform functions on entities. The basic entities are – <b>Customer</b> and <b>Card</b>.

## Requirements

Building the API client library requires [Maven](https://maven.apache.org/) to be installed.

## Installation

To install the API client library to your local Maven repository, simply execute the following in the base directory:

```shell
mvn clean install -DskipTests
```

To run all the test cases, follow these steps:
- Set the following credentials in the **config.cng** file available under resources. Please make sure to use only one sub section for **API Authentication** and **Field Level Encryption**. *Refer to the [Getting started](https://developer.visa.com/pages/working-with-visa-apis/create-project) to create an app for credentials.* If you are using Asymmetric Field Level Encryption (FLE), please use the file file provided by Visa as such for **ENCRYPTION_PUBLIC_KEY_PATH** configuration.

```
# Section 1: API Authentication
#  Sub-Section 1a: For Two-way mutual SSL authentication
AUTHENTICATION_METHOD = TWO_WAY_SSL
USERNAME = <YOUR USERNAME>
PASSWORD = <YOUR PASSWORD>
KEY_STORE_PATH = <YOUR KEYSTORE PATH>
KEY_STORE_PASSWORD = <YOUR KEYSTORE PASSWORD>
PRIVATE_KEY_PASSWORD = <YOUR PRIVATE KEY PASSWORD>
# ----------------
#  Sub-Section 1b: For X-Pay-Token authentication
#AUTHENTICATION_METHOD = X_PAY_TOKEN
#APIKEY = <YOUR API KEY>
#SHARED_SECRET = <YOUR SHARED SECRET>
# --------------------------------

# Section 2: Field Level Encryption
ENCRYPTION_KID = <YOUR ENCRYPTION KEY>
#  Sub-Section 2a: For Asymmetric Encryption using Visa public key
ENCRYPTION_METHOD = ASYMMETRIC
ENCRYPTION_PUBLIC_KEY_PATH = <FULL PATH OF PEM FILE PROVIDED BY VISA FOR ENCRYPTION>
# ----------------
#  Sub-Section 2b: For Symmetric Encryption using Shared secret
#ENCRYPTION_METHOD = SYMMETRIC
#ENCRYPTION_SHARED_SECRET = <YOUR ENCRYPTION KEY SHARED SECRET>
# --------------------------------

# Section 3: General Section
HOST = https://sandbox.api.visa.com/
# HOST = https://cert.api.visa.com/

# Section 4: Proxy Section
PROXY_HOST_NAME = <YOUR PROXY HOST>
PROXY_PORT_NUMBER = <YOUR PROXY PORT>
```

- Populate appropriate consumer values in the Test files, for the elements having the value *_placeholder*. Example:

```
String emailAddress = "email_placeholder";
```

- Now for testing all test cases, simply execute the following in the base directory:

```shell
mvn test
```

- If using Junit, you may also test specific test cases by executing the following in the base directory:

Example for testing enroll card API:

```shell
mvn test -Dtest=TestViap#test01a_enrollCard
```

## Authentication
Authentication schemes defined for the API:

### Two-way SSL
- **Type**: SSL Handshake
- **Location**: Private key in HTTP client and User credentials in HTTP Authorization Header

### x-pay-token
- **Type**: Time-bound Hash token in Request Header
- **Header name**: x-pay-token
- **Location**: HTTP Header

## Author
**Visa Developer Platform**