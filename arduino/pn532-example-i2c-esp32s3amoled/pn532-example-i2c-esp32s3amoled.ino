// #include "driver/i2c.h"
#include <Wire.h>
#include <PN532_I2C.h>
#include <PN532.h>
#include <NfcAdapter.h>


TwoWire one = TwoWire(0);
bool status = one.begin(3, 2, 400000);
PN532_I2C pn532_i2c(one);
NfcAdapter nfc = NfcAdapter(pn532_i2c);
String tagId = "None";
byte nuidPICC[4];

void setup() {
  Serial.begin(115200);
  Serial.println("System initialized");

  nfc.begin();
}

void loop() {
  readNFC();
}

void readNFC() {
 if (nfc.tagPresent()) {
   NfcTag tag = nfc.read();
   tag.print();
   tagId = tag.getUidString();
 }
 delay(5000);
}