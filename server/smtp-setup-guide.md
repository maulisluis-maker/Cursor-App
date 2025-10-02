# 🚀 SMTP-Server Einrichtung für Fitnessstudio

## Option 1: Eigenen SMTP-Server auf Ihrem Server

### Voraussetzungen:
- VPS/Dedicated Server mit Linux
- Domain mit DNS-Zugriff
- Root-Zugriff auf den Server

### Schritt 1: Postfix installieren
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postfix mailutils

# CentOS/RHEL
sudo yum install postfix mailx
```

### Schritt 2: Postfix konfigurieren
```bash
sudo nano /etc/postfix/main.cf
```

**Wichtige Einstellungen:**
```conf
# Server-Identität
myhostname = mail.ihr-fitnessstudio.de
mydomain = ihr-fitnessstudio.de
myorigin = $mydomain

# Netzwerk-Einstellungen
inet_interfaces = all
inet_protocols = ipv4

# Authentifizierung
smtpd_sasl_auth_enable = yes
smtpd_sasl_security_options = noanonymous
smtpd_sasl_local_domain = $myhostname

# TLS/SSL
smtpd_tls_cert_file = /etc/ssl/certs/mail.crt
smtpd_tls_key_file = /etc/ssl/private/mail.key
smtpd_use_tls = yes
smtpd_tls_security_level = may
```

### Schritt 3: SSL-Zertifikat erstellen
```bash
# Self-signed Zertifikat (für Tests)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/mail.key \
  -out /etc/ssl/certs/mail.crt
```

### Schritt 4: DNS-Einträge konfigurieren
```dns
# A-Record für Mail-Server
mail.ihr-fitnessstudio.de.  IN  A   IHRE-SERVER-IP

# MX-Record
ihr-fitnessstudio.de.        IN  MX  10 mail.ihr-fitnessstudio.de.

# SPF-Record (für bessere Zustellbarkeit)
ihr-fitnessstudio.de.        IN  TXT "v=spf1 mx a ip4:IHRE-SERVER-IP ~all"
```

### Schritt 5: Postfix starten
```bash
sudo systemctl enable postfix
sudo systemctl start postfix
sudo systemctl status postfix
```

### Schritt 6: Firewall konfigurieren
```bash
# Port 25 (SMTP), 587 (SMTP Submission), 465 (SMTPS)
sudo ufw allow 25
sudo ufw allow 587
sudo ufw allow 465
```

## Option 2: Cloud-basierte SMTP-Dienste

### A. Gmail SMTP (Empfohlen für Start)
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="ihr-fitnessstudio@gmail.com"
SMTP_PASS="ihr-app-passwort"
MAIL_FROM="noreply@ihr-fitnessstudio.de"
```

**Gmail App-Passwort erstellen:**
1. Google-Konto → Sicherheit
2. 2-Faktor-Authentifizierung aktivieren
3. App-Passwörter → Neues App-Passwort
4. "Fitnessstudio SMTP" eingeben

### B. SendGrid (Professionell)
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="SG.IHR-SENDGRID-API-KEY"
MAIL_FROM="noreply@ihr-fitnessstudio.de"
```

### C. Amazon SES (Skalierbar)
```env
SMTP_HOST="email-smtp.eu-west-1.amazonaws.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="IHRE-SES-SMTP-USERNAME"
SMTP_PASS="IHRE-SES-SMTP-PASSWORD"
MAIL_FROM="noreply@ihr-fitnessstudio.de"
```

## Option 3: Domain-Provider SMTP

### Beispiel: Strato, 1&1, GoDaddy
```env
SMTP_HOST="smtp.strato.de"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="noreply@ihr-fitnessstudio.de"
SMTP_PASS="ihr-domain-passwort"
MAIL_FROM="noreply@ihr-fitnessstudio.de"
```

## 🔧 Konfiguration in der Anwendung

### 1. .env-Datei erstellen
```bash
cd server
nano .env
```

### 2. SMTP-Einstellungen eintragen
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="ihr-super-secret-jwt-key"

# SMTP Configuration
SMTP_HOST="mail.ihr-fitnessstudio.de"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="noreply@ihr-fitnessstudio.de"
SMTP_PASS="ihr-smtp-passwort"
MAIL_FROM="noreply@ihr-fitnessstudio.de"

# CORS
CORS_ORIGIN="http://localhost:3001"

# Server
PORT="4000"
```

### 3. Server neu starten
```bash
pkill -f "tsx src/index.ts"
cd server && npx tsx src/index.ts
```

## 🧪 SMTP-Test

### Test-E-Mail senden
```bash
curl -s -H "Authorization: Bearer demo-token" \
  -H "Content-Type: application/json" \
  -d '{"memberId":"MEMBER001","email":"test@example.com"}' \
  http://localhost:4000/api/email/send-qr-code
```

### SMTP-Verbindung testen
```bash
# Telnet-Test
telnet mail.ihr-fitnessstudio.de 587

# OpenSSL-Test
openssl s_client -connect mail.ihr-fitnessstudio.de:587 -starttls smtp
```

## 📧 E-Mail-Templates anpassen

### Branding in EmailService anpassen
```typescript
// server/src/services/emailService.ts
const mailOptions = {
  from: '"🏋️ Ihr Fitnessstudio" <noreply@ihr-fitnessstudio.de>',
  // ... rest of configuration
};
```

## 🔒 Sicherheit

### SPF/DKIM/DMARC konfigurieren
```dns
# SPF Record
ihr-fitnessstudio.de. IN TXT "v=spf1 mx a ip4:IHRE-SERVER-IP ~all"

# DKIM Record (nach DKIM-Setup)
default._domainkey.ihr-fitnessstudio.de. IN TXT "v=DKIM1; k=rsa; p=IHRE-DKIM-PUBLIC-KEY"

# DMARC Record
_dmarc.ihr-fitnessstudio.de. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@ihr-fitnessstudio.de"
```

## 💡 Empfehlungen

### Für Startups:
- **Gmail SMTP** (einfach, kostenlos, 500 E-Mails/Tag)

### Für wachsende Unternehmen:
- **SendGrid** (professionell, 100 E-Mails/Tag kostenlos)

### Für große Unternehmen:
- **Eigener SMTP-Server** (vollständige Kontrolle)
- **Amazon SES** (skalierbar, kostengünstig)

## 🚨 Troubleshooting

### Häufige Probleme:
1. **Port 25 blockiert** → Port 587 verwenden
2. **SSL/TLS-Fehler** → Zertifikate prüfen
3. **Authentifizierung fehlschlägt** → Passwörter prüfen
4. **E-Mails im Spam** → SPF/DKIM konfigurieren

