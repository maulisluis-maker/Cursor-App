#!/bin/bash

echo "🍎 Apple Developer Certificate Setup für .pkpass"
echo "================================================"

# Create certificates directory
mkdir -p certs

# Generate private key
echo "1. Private Key generieren..."
openssl genrsa -out certs/private.key 2048

# Generate certificate request
echo "2. Certificate Request generieren..."
openssl req -new -key certs/private.key -out certs/certificate.csr -subj "/C=DE/ST=Germany/L=Berlin/O=Fitness Studio/CN=pass.com.fitnessstudio.membership"

# Download Apple WWDR certificate
echo "3. Apple WWDR Certificate herunterladen..."
curl -o certs/wwdr.pem https://developer.apple.com/certificationauthority/AppleWWDRCA.cer

echo ""
echo "✅ Setup abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Gehe zu: https://developer.apple.com/account/resources/identifiers/list/passTypeId"
echo "2. Erstelle eine neue Pass Type ID: pass.com.fitnessstudio.membership"
echo "3. Lade certs/certificate.csr hoch"
echo "4. Lade das generierte Certificate herunter"
echo "5. Konvertiere es zu .pem: openssl x509 -in certificate.cer -inform DER -out certs/cert.pem"
echo ""
echo "📁 Erstellte Dateien:"
echo "- certs/private.key (Private Key)"
echo "- certs/certificate.csr (Certificate Request)"
echo "- certs/wwdr.pem (Apple WWDR Certificate)"
echo ""
echo "🔧 Environment Variables:"
echo "APPLE_PASS_TYPE_ID=pass.com.fitnessstudio.membership"
echo "APPLE_TEAM_ID=DEIN_TEAM_ID"
echo "APPLE_CERT_PATH=./certs/cert.pem"
echo "APPLE_KEY_PATH=./certs/private.key"
echo "APPLE_WWDR_PATH=./certs/wwdr.pem"
