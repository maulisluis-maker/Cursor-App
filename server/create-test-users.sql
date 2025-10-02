-- Test Users für Fitnessstudio
-- Führe diese Befehle in der Datenbank aus

-- Admin User erstellen
INSERT INTO users (id, email, passwordHash, role, createdAt, updatedAt) 
VALUES (
  'admin-test-id',
  'admin@fitnessstudio.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', -- admin123
  'ADMIN',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Member User erstellen
INSERT INTO users (id, email, passwordHash, role, createdAt, updatedAt) 
VALUES (
  'member-test-id',
  'member@fitnessstudio.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', -- member123
  'MEMBER',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Member Daten erstellen
INSERT INTO members (id, membershipId, firstName, lastName, email, points, status, createdAt, updatedAt, userId)
VALUES (
  'member-data-id',
  'MEMBER001',
  'Max',
  'Mustermann',
  'member@fitnessstudio.com',
  50,
  'ACTIVE',
  NOW(),
  NOW(),
  'member-test-id'
) ON CONFLICT (membershipId) DO NOTHING;
