#!/bin/bash

# 🚀 SMTP Setup Script für Fitnessstudio
# Dieses Skript hilft bei der Einrichtung der SMTP-Konfiguration

echo "🏋️ Fitnessstudio SMTP Setup"
echo "=========================="
echo ""

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktionen
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Prüfe ob .env Datei existiert
if [ ! -f ".env" ]; then
    print_info "Erstelle .env Datei..."
    cat > .env << EOF
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
MAIL_FROM="noreply@your-fitnessstudio.com"

# CORS
CORS_ORIGIN="http://localhost:3001"

# Server
PORT="4000"
EOF
    print_success ".env Datei erstellt"
else
    print_warning ".env Datei existiert bereits"
fi

echo ""
echo "🔧 SMTP-Konfiguration auswählen:"
echo "1. Gmail SMTP (Empfohlen für Start)"
echo "2. SendGrid (Professionell)"
echo "3. Amazon SES (Skalierbar)"
echo "4. Eigenen SMTP-Server"
echo "5. Domain-Provider SMTP"
echo "6. Nur .env Datei anzeigen"
echo ""

read -p "Wählen Sie eine Option (1-6): " choice

case $choice in
    1)
        print_info "Gmail SMTP Konfiguration"
        echo ""
        read -p "Gmail E-Mail-Adresse: " gmail_email
        read -p "App-Passwort (nicht Ihr normales Passwort): " app_password
        read -p "Absender-E-Mail (z.B. noreply@ihr-fitnessstudio.de): " from_email
        
        # Update .env
        sed -i.bak "s/SMTP_HOST=.*/SMTP_HOST=\"smtp.gmail.com\"/" .env
        sed -i.bak "s/SMTP_PORT=.*/SMTP_PORT=\"587\"/" .env
        sed -i.bak "s/SMTP_SECURE=.*/SMTP_SECURE=\"false\"/" .env
        sed -i.bak "s/SMTP_USER=.*/SMTP_USER=\"$gmail_email\"/" .env
        sed -i.bak "s/SMTP_PASS=.*/SMTP_PASS=\"$app_password\"/" .env
        sed -i.bak "s/MAIL_FROM=.*/MAIL_FROM=\"$from_email\"/" .env
        
        print_success "Gmail SMTP konfiguriert!"
        echo ""
        print_info "Wichtige Hinweise für Gmail:"
        echo "1. 2-Faktor-Authentifizierung muss aktiviert sein"
        echo "2. App-Passwort unter Google-Konto → Sicherheit erstellen"
        echo "3. Maximal 500 E-Mails pro Tag (kostenlos)"
        ;;
        
    2)
        print_info "SendGrid Konfiguration"
        echo ""
        read -p "SendGrid API Key: " sendgrid_key
        read -p "Absender-E-Mail: " from_email
        
        # Update .env
        sed -i.bak "s/SMTP_HOST=.*/SMTP_HOST=\"smtp.sendgrid.net\"/" .env
        sed -i.bak "s/SMTP_PORT=.*/SMTP_PORT=\"587\"/" .env
        sed -i.bak "s/SMTP_SECURE=.*/SMTP_SECURE=\"false\"/" .env
        sed -i.bak "s/SMTP_USER=.*/SMTP_USER=\"apikey\"/" .env
        sed -i.bak "s/SMTP_PASS=.*/SMTP_PASS=\"$sendgrid_key\"/" .env
        sed -i.bak "s/MAIL_FROM=.*/MAIL_FROM=\"$from_email\"/" .env
        
        print_success "SendGrid konfiguriert!"
        ;;
        
    3)
        print_info "Amazon SES Konfiguration"
        echo ""
        read -p "SES SMTP Username: " ses_username
        read -p "SES SMTP Password: " ses_password
        read -p "AWS Region (z.B. eu-west-1): " aws_region
        read -p "Absender-E-Mail: " from_email
        
        # Update .env
        sed -i.bak "s/SMTP_HOST=.*/SMTP_HOST=\"email-smtp.$aws_region.amazonaws.com\"/" .env
        sed -i.bak "s/SMTP_PORT=.*/SMTP_PORT=\"587\"/" .env
        sed -i.bak "s/SMTP_SECURE=.*/SMTP_SECURE=\"false\"/" .env
        sed -i.bak "s/SMTP_USER=.*/SMTP_USER=\"$ses_username\"/" .env
        sed -i.bak "s/SMTP_PASS=.*/SMTP_PASS=\"$ses_password\"/" .env
        sed -i.bak "s/MAIL_FROM=.*/MAIL_FROM=\"$from_email\"/" .env
        
        print_success "Amazon SES konfiguriert!"
        ;;
        
    4)
        print_info "Eigener SMTP-Server Konfiguration"
        echo ""
        read -p "SMTP Host (z.B. mail.ihr-fitnessstudio.de): " smtp_host
        read -p "SMTP Port (587 oder 465): " smtp_port
        read -p "SMTP Benutzer: " smtp_user
        read -p "SMTP Passwort: " smtp_pass
        read -p "Absender-E-Mail: " from_email
        
        # Bestimme secure basierend auf Port
        if [ "$smtp_port" = "465" ]; then
            smtp_secure="true"
        else
            smtp_secure="false"
        fi
        
        # Update .env
        sed -i.bak "s/SMTP_HOST=.*/SMTP_HOST=\"$smtp_host\"/" .env
        sed -i.bak "s/SMTP_PORT=.*/SMTP_PORT=\"$smtp_port\"/" .env
        sed -i.bak "s/SMTP_SECURE=.*/SMTP_SECURE=\"$smtp_secure\"/" .env
        sed -i.bak "s/SMTP_USER=.*/SMTP_USER=\"$smtp_user\"/" .env
        sed -i.bak "s/SMTP_PASS=.*/SMTP_PASS=\"$smtp_pass\"/" .env
        sed -i.bak "s/MAIL_FROM=.*/MAIL_FROM=\"$from_email\"/" .env
        
        print_success "Eigener SMTP-Server konfiguriert!"
        ;;
        
    5)
        print_info "Domain-Provider SMTP Konfiguration"
        echo ""
        echo "Häufige Provider:"
        echo "- Strato: smtp.strato.de"
        echo "- 1&1: smtp.1und1.de"
        echo "- GoDaddy: smtpout.secureserver.net"
        echo ""
        read -p "SMTP Host: " smtp_host
        read -p "SMTP Port (587 oder 465): " smtp_port
        read -p "E-Mail-Adresse: " smtp_user
        read -p "E-Mail-Passwort: " smtp_pass
        
        # Bestimme secure basierend auf Port
        if [ "$smtp_port" = "465" ]; then
            smtp_secure="true"
        else
            smtp_secure="false"
        fi
        
        # Update .env
        sed -i.bak "s/SMTP_HOST=.*/SMTP_HOST=\"$smtp_host\"/" .env
        sed -i.bak "s/SMTP_PORT=.*/SMTP_PORT=\"$smtp_port\"/" .env
        sed -i.bak "s/SMTP_SECURE=.*/SMTP_SECURE=\"$smtp_secure\"/" .env
        sed -i.bak "s/SMTP_USER=.*/SMTP_USER=\"$smtp_user\"/" .env
        sed -i.bak "s/SMTP_PASS=.*/SMTP_PASS=\"$smtp_pass\"/" .env
        sed -i.bak "s/MAIL_FROM=.*/MAIL_FROM=\"$smtp_user\"/" .env
        
        print_success "Domain-Provider SMTP konfiguriert!"
        ;;
        
    6)
        print_info "Aktuelle .env Konfiguration:"
        echo ""
        cat .env
        exit 0
        ;;
        
    *)
        print_error "Ungültige Option"
        exit 1
        ;;
esac

echo ""
print_info "Aktuelle SMTP-Konfiguration:"
echo ""
cat .env | grep -E "(SMTP_|MAIL_)"

echo ""
print_info "Nächste Schritte:"
echo "1. Server neu starten: pkill -f 'tsx src/index.ts' && npx tsx src/index.ts"
echo "2. Test-E-Mail senden: curl -s -H 'Authorization: Bearer demo-token' -H 'Content-Type: application/json' -d '{\"memberId\":\"MEMBER001\",\"email\":\"test@example.com\"}' http://localhost:4000/api/email/send-qr-code"
echo "3. E-Mail-Templates in server/src/services/emailService.ts anpassen"

echo ""
print_success "SMTP-Setup abgeschlossen!"

