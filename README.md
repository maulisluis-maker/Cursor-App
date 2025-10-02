# Fitnessstudio Web-App (Self-hosted)

Dieses Projekt enthält ein Next.js Frontend (Member-Portal + Admin-Dashboard) und ein Express/Node.js Backend mit PostgreSQL (via Prisma). JWT-basierte Authentifizierung, Grundmodelle für Mitglieder und Punkte sowie Stubs für Apple/Google Wallet Pässe sind enthalten.

## Schnellstart

Voraussetzungen:
- Node.js >= 18
- PostgreSQL Datenbank

1. `.env` Dateien anlegen (siehe `.env.example` im Projektwurzelverzeichnis sowie `server/.env.example` und `web/.env.example`).
2. Abhängigkeiten installieren und Prisma Client generieren:

```bash
npm install
npm run db:push
```

3. Entwicklung starten (Frontend auf Port 3000, Backend auf Port 4000):

```bash
npm run dev
```

## Verzeichnisse
- `server/` Express API + Prisma ORM
- `web/` Next.js Frontend

## Nächste Schritte
- Wallet-Pass-Erstellung (Apple .pkpass, Google Wallet) in `server/src/services/wallet/` implementieren und Zertifikate/Keys in `.env` pflegen
- DSGVO-Checkliste: Datenminimierung, Export/Deletion Endpunkte prüfen und ergänzen
