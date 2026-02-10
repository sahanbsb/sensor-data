#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <DHT.h>
#include <ArduinoJson.h>

// --- CONFIG ---
const char* ssid = "WiFi-SSID";
const char* password = "WiFi-Password";
const char* serverUrl = "https://your.domain/update-sensor";
const char* apiKey = "super-secret-api-key";

#define DHTPIN D4     // Digital pin connected to the DHT sensor
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (isnan(h) || isnan(t)) {
      Serial.println("Failed to read from DHT sensor!");
    } else {
      // Use WiFiClientSecure for HTTPS
      WiFiClientSecure client;
      
      // This tells the ESP8266 to trust the server without checking the CA fingerprint
      client.setInsecure(); 

      HTTPClient http;

      // Initialize the connection
      if (http.begin(client, serverUrl)) {
        http.addHeader("Content-Type", "application/json");
        http.addHeader("X-API-Key", apiKey);

        // Build JSON safely
        StaticJsonDocument<128> doc;
        doc["temp"] = t;
        doc["hum"] = h;
        String requestBody;
        serializeJson(doc, requestBody);

        int httpResponseCode = http.POST(requestBody);
        
        if (httpResponseCode > 0) {
          Serial.printf("HTTP Response code: %d\n", httpResponseCode);
          String payload = http.getString();
          Serial.println(payload);
        } else {
          Serial.printf("Error code: %d - %s\n", httpResponseCode, http.errorToString(httpResponseCode).c_str());
        }
        http.end();
      }
    }
  }
  delay(600000); // 10 mins
}