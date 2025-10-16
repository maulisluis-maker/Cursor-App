import { SignJWT } from 'jose';
import { createPrivateKey } from 'crypto';
import { WalletPassPayload, DesignData } from './types';

export class GoogleWalletServiceReal {
  private issuerId: string;
  private classId: string;
  private credentials: any;

  constructor() {
    this.issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || '';
    this.classId = `${this.issuerId}.fitnessstudio_membership`;
    
    // Load credentials from environment
    this.credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_WALLET_PROJECT_ID,
      private_key_id: process.env.GOOGLE_WALLET_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_WALLET_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_WALLET_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_WALLET_CLIENT_ID,
    };

    console.log('✅ Google Wallet Service initialized with JWT-based authentication');
  }

  async generatePass(payload: WalletPassPayload, designData: DesignData): Promise<any> {
    try {
      if (!this.issuerId || !this.credentials.private_key || !this.credentials.client_email) {
        throw new Error('Google Wallet credentials not configured');
      }

      // Create a simpler generic object with proper ID format
      const objectId = `${this.issuerId}.${payload.membershipId.replace(/[^a-zA-Z0-9]/g, '')}`;
      
      // Create the generic object with minimal required fields
      const genericObject = {
        id: objectId,
        classId: this.classId,
        state: 'ACTIVE',
        hexBackgroundColor: (designData.primaryColor || '#3b82f6').replace('#', ''),
        cardTitle: {
          defaultValue: {
            language: 'de',
            value: 'XKYS Fitness'
          }
        },
        header: {
          defaultValue: {
            language: 'de',
            value: 'Mitgliedsnummer'
          }
        },
        headerValue: {
          defaultValue: {
            language: 'de',
            value: payload.membershipId
          }
        },
        subheader: {
          defaultValue: {
            language: 'de',
            value: payload.fullName
          }
        },
        barcode: {
          type: 'QR_CODE',
          value: payload.membershipId,
          alternateText: payload.membershipId
        }
      };

      // Create JWT
      const jwt = await this.createJWT(genericObject);

      // Generate pass URL
      const passUrl = `https://pay.google.com/gp/v/save/${jwt}`;

      return {
        success: true,
        passId: objectId,
        passUrl: passUrl,
        jwt: jwt
      };

    } catch (error) {
      console.error('Google Wallet pass generation error:', error);
      throw error;
    }
  }

  private async createJWT(genericObject: any): Promise<string> {
    try {
      // Create private key object
      const privateKey = createPrivateKey(this.credentials.private_key);

      // Create JWT payload
      const claims = {
        iss: this.credentials.client_email,
        aud: 'google',
        origins: ['http://localhost:3000', 'https://xkys.de'],
        typ: 'savetowallet',
        payload: {
          genericObjects: [genericObject]
        }
      };

      // Sign JWT
      const jwt = await new SignJWT(claims)
        .setProtectedHeader({
          alg: 'RS256',
          typ: 'JWT',
          kid: this.credentials.private_key_id
        })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(privateKey);

      return jwt;

    } catch (error) {
      console.error('JWT creation error:', error);
      throw error;
    }
  }

  async getPassFile(membershipId: string): Promise<Buffer> {
    throw new Error('Google Wallet does not use pass files, use JWT instead');
  }
}
