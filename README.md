# hack2sol
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://travis-ci.org/TobiasOetzel/hack2sol.svg?branch=master)](https://travis-ci.org/TobiasOetzel/hack2sol)



## hue setup
1. https://www.developers.meethue.com/documentation/getting-started (step 3) for retrieving a user token

Mapping Table

IoT Services | IoT Application Enablement    
--|--
Device       |  NA                           
SensorType   |  Thing Type                        
Sensor       |  Thing                             
Capability   |  Property Set                       
Property     |  Property                          


## how to use the certificate

1. Choose your device in the IOT service cockpit
2. generate and download the certificate note the secret
3. create a file ./certificate/passphrase paste the secret
4. create a file ./certificate/key paste the key of the certificate starting with
```
-----BEGIN ENCRYPTED PRIVATE KEY-----
many lines
-----END ENCRYPTED PRIVATE KEY-----
```
5. create a file ./certificate/cert paste the key
```
-----BEGIN CERTIFICATE-----
many lines
-----END CERTIFICATE-----
```