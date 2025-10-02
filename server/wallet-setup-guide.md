# 🏋️ Wallet-Integration Setup Guide

## 📱 Apple Wallet Setup

### 1. Apple Developer Account
- Melde dich bei [developer.apple.com](https://developer.apple.com) an
- Erstelle ein **Pass Type ID** Certificate
- Lade das **Signing Certificate** (.p12) herunter
- Lade das **WWDR Certificate** herunter

### 2. Zertifikate konfigurieren
```bash
# Erstelle Verzeichnis für Zertifikate
mkdir -p server/certificates/apple

# Kopiere deine Zertifikate:
# - Signing Certificate (.p12) → server/certificates/apple/signing.p12
# - WWDR Certificate (.cer) → server/certificates/apple/wwdr.cer
```

### 3. Environment Variablen setzen
```bash
# In server/.env
APPLE_WALLET_TEAM_ID="DEINE_TEAM_ID"
APPLE_WALLET_PASS_TYPE_ID="pass.com.xkys.fitnessstudio"
APPLE_WALLET_ORGANIZATION_NAME="XKYS Fitnessstudio"
APPLE_WALLET_CERTIFICATE_PATH="server/certificates/apple/signing.p12"
APPLE_WALLET_PRIVATE_KEY_PATH="server/certificates/apple/signing.key"
APPLE_WALLET_WWDR_PATH="server/certificates/apple/wwdr.cer"
```

---

## 🏪 Google Wallet Setup

### 1. Google Cloud Console
- Gehe zu [console.cloud.google.com](https://console.cloud.google.com)
- Erstelle ein neues Projekt oder wähle ein bestehendes
- Aktiviere die **Google Wallet API**

### 2. Service Account erstellen
- Gehe zu **IAM & Admin** → **Service Accounts**
- Erstelle einen neuen Service Account
- Lade die **JSON-Schlüsseldatei** herunter

### 3. Google Wallet Issuer Account
- Gehe zu [pay.google.com/business/console](https://pay.google.com/business/console)
- Erstelle ein **Issuer Account**
- Verknüpfe dein Google Cloud Projekt

### 4. Environment Variablen setzen
```bash
# In server/.env
GOOGLE_WALLET_PROJECT_ID="dein-project-id"
GOOGLE_WALLET_ISSUER_ID="dein-issuer-id"
GOOGLE_WALLET_PRIVATE_KEY_ID="aus-der-json-datei"
GOOGLE_WALLET_PRIVATE_KEY="aus-der-json-datei"
GOOGLE_WALLET_CLIENT_EMAIL="aus-der-json-datei"
GOOGLE_WALLET_CLIENT_ID="aus-der-json-datei"
```

---

## 🚀 Test der Wallet-Integration

### 1. Design Center testen
```bash
# Server starten
npm run dev

# Design Center öffnen
http://localhost:3001/admin/design-center
```

### 2. Wallet-Pass generieren
- Erstelle ein Design im Design Center
- Klicke auf **Apple Wallet Test** oder **Google Wallet Test**
- Überprüfe die generierten URLs

### 3. Echte Wallet-Tests
- **Apple Wallet**: Öffne die .pkpass URL auf einem iOS-Gerät
- **Google Wallet**: Öffne die Pass-URL auf einem Android-Gerät

---

## 🔧 Troubleshooting

### Apple Wallet Probleme
- **Zertifikat ungültig**: Überprüfe Ablaufdatum und Team ID
- **Pass wird nicht angezeigt**: Überprüfe Pass Type ID
- **Signing-Fehler**: Überprüfe Zertifikatspfade

### Google Wallet Probleme
- **API-Fehler**: Überprüfe Service Account Berechtigungen
- **Issuer-Fehler**: Überprüfe Issuer ID und Verknüpfung
- **JWT-Fehler**: Überprüfe Private Key Format

### Allgemeine Probleme
- **Server startet nicht**: Überprüfe alle Environment Variablen
- **Design Center lädt nicht**: Überprüfe Frontend/Backend Verbindung
- **Wallet-Buttons reagieren nicht**: Überprüfe Authentifizierung

---

## 📚 Nützliche Links

- [Apple Wallet Developer Guide](https://developer.apple.com/wallet/)
- [Google Wallet API Documentation](https://developers.google.com/wallet)
- [Passkit Generator Documentation](https://github.com/alexandercerutti/passkit-generator)
- [Google APIs Client Library](https://github.com/googleapis/googleapis)
