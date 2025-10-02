import { google } from 'googleapis';
import { WalletPassPayload, DesignData } from './types';

export class GoogleWalletServiceReal {
  private auth: any;
  private wallet: any;
  private issuerId: string;
  private classId: string;

  constructor() {
    this.issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || 'demo_issuer';
    this.classId = `${this.issuerId}.fitnessstudio_membership`;
    this.initializeGoogleWallet();
  }

  private async initializeGoogleWallet() {
    try {
      // Initialize with real service account credentials
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          type: 'service_account',
          project_id: process.env.GOOGLE_WALLET_PROJECT_ID,
          private_key_id: process.env.GOOGLE_WALLET_PRIVATE_KEY_ID,
          private_key: process.env.GOOGLE_WALLET_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.GOOGLE_WALLET_CLIENT_EMAIL,
          client_id: process.env.GOOGLE_WALLET_CLIENT_ID,
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_WALLET_CLIENT_EMAIL}`
        },
        scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
      });

      // Initialize Google Wallet API
      this.wallet = google.walletobjects({ version: 'v1', auth: this.auth });
      
      // Create the generic class if it doesn't exist
      await this.createGenericClass();

      console.log('✅ Google Wallet API successfully initialized');

    } catch (error) {
      console.error('❌ Failed to initialize Google Wallet API:', error);
      throw error;
    }
  }

  private async createGenericClass() {
    try {
      const genericClass = {
        id: this.classId,
        classTemplateInfo: {
          cardTemplateOverride: {
            cardRowTemplateInfos: [
              {
                twoItems: {
                  startItem: {
                    firstValue: {
                      fields: [
                        {
                          fieldPath: 'object.textModulesData["membership_info"]'
                        }
                      ]
                    }
                  },
                  endItem: {
                    firstValue: {
                      fields: [
                        {
                          fieldPath: 'object.textModulesData["points_info"]'
                        }
                      ]
                    }
                  }
                }
              }
            ]
          }
        }
      };

      await this.wallet.genericclass.insert({ requestBody: genericClass });
      console.log('✅ Google Wallet generic class created');
      
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ Generic class already exists');
      } else {
        console.error('❌ Failed to create generic class:', error);
        throw error;
      }
    }
  }

  async generatePass(
    payload: WalletPassPayload, 
    designData: DesignData
  ): Promise<{ passId: string; jwt: string; passUrl: string }> {
    try {
      // Create Google Wallet Generic Object with design data
      const genericObject = {
        id: `${this.issuerId}.${payload.membershipId}`,
        classId: this.classId,
        state: 'ACTIVE',
        barcode: {
          type: 'QR_CODE',
          value: payload.qrData,
          alternateText: payload.membershipId
        },
        textModulesData: [
          {
            header: 'Mitgliedschaft',
            body: 'Premium Membership',
            id: 'membership_info'
          },
          {
            header: 'Punkte',
            body: payload.points.toString(),
            id: 'points_info'
          },
          {
            header: 'Mitglied seit',
            body: new Date().toLocaleDateString('de-DE'),
            id: 'member_since'
          }
        ],
        linksModuleData: {
          uris: [
            {
              uri: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/member`,
              description: 'Mitgliederportal',
              id: 'member_portal'
            },
            {
              uri: `${process.env.FRONTEND_URL || 'http://localhost:3001'}`,
              description: 'XKYS Fitnessstudio',
              id: 'website'
            }
          ]
        },
        imageModulesData: [
          {
            mainImage: {
              sourceUri: {
                uri: `${process.env.BASE_URL || 'http://localhost:4000'}/api/wallet/logo`
              }
            }
          }
        ],
        // Apply design colors
        hexBackgroundColor: this.hexToRgb(designData.primaryColor || '#1f2937'),
        logo: {
          sourceUri: {
            uri: `${process.env.BASE_URL || 'http://localhost:4000'}/api/wallet/logo`
          }
        }
      };

      // Insert the generic object
      const response = await this.wallet.genericobject.insert({
        requestBody: genericObject
      });

      const passId = response.data.id || genericObject.id;
      
      // Create JWT for Google Wallet
      const jwt = await this.createJWT(genericObject);

      const passUrl = `https://pay.google.com/gp/v/save/${jwt}`;

      return {
        passId,
        jwt,
        passUrl
      };

    } catch (error) {
      console.error('❌ Google Wallet pass generation failed:', error);
      throw new Error(`Failed to generate Google Wallet pass: ${error.message}`);
    }
  }

  private async createJWT(genericObject: any): Promise<string> {
    try {
      // Create JWT payload for Google Wallet
      const payload = {
        iss: this.auth.credentials.client_email,
        aud: 'google',
        typ: 'savetowallet',
        iat: Math.floor(Date.now() / 1000),
        payload: {
          genericObjects: [genericObject]
        }
      };

      // Sign JWT with private key
      const jwt = require('jsonwebtoken');
      const privateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      const token = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        keyid: process.env.GOOGLE_WALLET_PRIVATE_KEY_ID
      });

      return token;

    } catch (error) {
      console.error('❌ JWT creation failed:', error);
      throw new Error('Failed to create Google Wallet JWT');
    }
  }

  private hexToRgb(hex: string): string {
    // Convert hex color to RGB format for Google Wallet
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return '1f2937'; // Default color
  }
}
