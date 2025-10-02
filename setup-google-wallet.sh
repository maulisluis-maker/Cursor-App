#!/bin/bash

echo "=== GOOGLE WALLET SETUP SCRIPT ==="
echo ""
echo "Dieses Script hilft dir bei der Einrichtung der Google Wallet Integration."
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq ist nicht installiert. Bitte installiere es:"
    echo "   macOS: brew install jq"
    echo "   Ubuntu: sudo apt-get install jq"
    echo "   Windows: choco install jq"
    exit 1
fi

echo "📋 SCHRITT 1: Google Cloud Console Setup"
echo "1. Gehe zu https://console.cloud.google.com/"
echo "2. Erstelle ein neues Projekt oder wähle ein bestehendes"
echo "3. Aktiviere die Google Wallet API:"
echo "   - Gehe zu 'APIs & Services' > 'Library'"
echo "   - Suche nach 'Google Wallet API'"
echo "   - Klicke 'Enable'"
echo ""

read -p "Drücke Enter wenn du Schritt 1 abgeschlossen hast..."

echo "📋 SCHRITT 2: Service Account erstellen"
echo "1. Gehe zu 'APIs & Services' > 'Credentials'"
echo "2. Klicke 'Create Credentials' > 'Service Account'"
echo "3. Name: 'fitnessstudio-wallet'"
echo "4. Beschreibung: 'Service Account für Google Wallet Integration'"
echo "5. Klicke 'Create and Continue'"
echo "6. Rolle: 'Wallet API Admin'"
echo "7. Klicke 'Done'"
echo ""

read -p "Drücke Enter wenn du Schritt 2 abgeschlossen hast..."

echo "📋 SCHRITT 3: JSON Key herunterladen"
echo "1. Klicke auf den erstellten Service Account"
echo "2. Gehe zu 'Keys' Tab"
echo "3. Klicke 'Add Key' > 'Create new key'"
echo "4. Wähle 'JSON'"
echo "5. Klicke 'Create'"
echo "6. Die Datei wird automatisch heruntergeladen"
echo ""

read -p "Drücke Enter wenn du die JSON-Datei heruntergeladen hast..."

echo "📋 SCHRITT 4: Environment Variable setzen"
echo ""

# Ask for the JSON file path
read -p "Gib den Pfad zur heruntergeladenen JSON-Datei ein: " json_file_path

if [ ! -f "$json_file_path" ]; then
    echo "❌ Datei nicht gefunden: $json_file_path"
    exit 1
fi

# Read and validate JSON
if ! jq empty "$json_file_path" 2>/dev/null; then
    echo "❌ Ungültige JSON-Datei"
    exit 1
fi

# Extract key information
project_id=$(jq -r '.project_id' "$json_file_path")
client_email=$(jq -r '.client_email' "$json_file_path")
issuer_id=$(jq -r '.issuer_id // "NOT_FOUND"' "$json_file_path")

echo "✅ JSON-Datei ist gültig"
echo "   Projekt ID: $project_id"
echo "   Client Email: $client_email"
echo "   Issuer ID: $issuer_id"

if [ "$issuer_id" = "NOT_FOUND" ]; then
    echo ""
    echo "⚠️  Issuer ID nicht in der JSON-Datei gefunden."
    echo "   Du musst sie manuell hinzufügen:"
    echo "   1. Gehe zu Google Cloud Console"
    echo "   2. Wallet API > Issuer accounts"
    echo "   3. Erstelle einen neuen Issuer"
    echo "   4. Kopiere die Issuer ID"
    echo "   5. Füge sie zur JSON-Datei hinzu:"
    echo "      \"issuer_id\": \"DEINE_ISSUER_ID\""
    echo ""
    read -p "Gib die Issuer ID ein: " manual_issuer_id
    issuer_id=$manual_issuer_id
fi

# Create .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Erstelle server/.env Datei..."
    cp server/.env.example server/.env 2>/dev/null || touch server/.env
fi

# Read the JSON content and escape it for .env
json_content=$(cat "$json_file_path" | tr -d '\n' | sed 's/"/\\"/g')

# Update .env file
if grep -q "GOOGLE_SERVICE_ACCOUNT_KEY" server/.env; then
    # Replace existing line
    sed -i.bak "s|GOOGLE_SERVICE_ACCOUNT_KEY=.*|GOOGLE_SERVICE_ACCOUNT_KEY='$json_content'|" server/.env
else
    # Add new line
    echo "GOOGLE_SERVICE_ACCOUNT_KEY='$json_content'" >> server/.env
fi

echo "✅ Environment Variable gesetzt!"
echo ""

echo "📋 SCHRITT 5: Testen"
echo "1. Starte den Server neu: docker-compose restart server"
echo "2. Gehe zum Design Center"
echo "3. Klicke 'Google Wallet Pass exportieren'"
echo "4. Die Karte sollte in einem neuen Tab geöffnet werden"
echo ""

echo "🎉 Google Wallet Setup abgeschlossen!"
echo ""
echo "Nächste Schritte:"
echo "- Teste die Integration im Design Center"
echo "- Konfiguriere das Design der Loyalty Card"
echo "- Setze up E-Mail-Benachrichtigungen für neue Karten"
echo ""
