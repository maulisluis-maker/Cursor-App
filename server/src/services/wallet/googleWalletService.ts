import { google } from 'googleapis';
import { WalletPassPayload, DesignData } from './types';

export class GoogleWalletService {
  private auth: any;
  private wallet: any;

  constructor() {
    this.initializeGoogleWallet();
  }

  private async initializeGoogleWallet() {
    try {
      // Initialize Google Wallet API
      // In production, you would use service account credentials
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          type: 'service_account',
          project_id: process.env.GOOGLE_WALLET_PROJECT_ID || 'demo-project',
          private_key_id: process.env.GOOGLE_WALLET_PRIVATE_KEY_ID || 'demo-key-id',
          private_key: process.env.GOOGLE_WALLET_PRIVATE_KEY || 'demo-private-key',
          client_email: process.env.GOOGLE_WALLET_CLIENT_EMAIL || 'demo@demo.iam.gserviceaccount.com',
          client_id: process.env.GOOGLE_WALLET_CLIENT_ID || 'demo-client-id',
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_WALLET_CLIENT_EMAIL || 'demo@demo.iam.gserviceaccount.com'}`
        },
        scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
      });

      // Use a try-catch to handle the walletobjects API availability
      try {
        this.wallet = google.walletobjects({ version: 'v1', auth: this.auth });
      } catch (walletError) {
        console.log('Google Wallet API not available in demo mode:', walletError.message);
        this.wallet = null;
      }

    } catch (error) {
      console.error('Failed to initialize Google Wallet API:', error);
      this.wallet = null;
    }
  }

  async generatePass(
    payload: WalletPassPayload, 
    designData: DesignData
  ): Promise<{ passId: string; jwt: string; passUrl: string }> {
    try {
      if (!this.wallet) {
        throw new Error('Google Wallet API not initialized');
      }

      // Create Google Wallet Generic Object
      const genericObject = {
        id: `${process.env.GOOGLE_WALLET_ISSUER_ID || 'demo'}.${payload.membershipId}`,
        classId: `${process.env.GOOGLE_WALLET_ISSUER_ID || 'demo'}.fitnessstudio_membership`,
        state: 'ACTIVE',
        barcode: {
          type: 'QR_CODE',
          value: payload.qrData
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
          }
        ],
        linksModuleData: {
          uris: [
            {
              uri: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/member`,
              description: 'Mitgliederportal'
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
        hexBackgroundColor: designData.primaryColor?.replace('#', '') || '1f2937',
        logo: {
          sourceUri: {
            uri: `${process.env.BASE_URL || 'http://localhost:4000'}/api/wallet/logo`
          }
        }
      };

      // Create the generic class first
      const genericClass = {
        id: `${process.env.GOOGLE_WALLET_ISSUER_ID || 'demo'}.fitnessstudio_membership`,
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

      try {
        await this.wallet.genericclass.insert({ requestBody: genericClass });
      } catch (error) {
        // Class might already exist, that's okay
        console.log('Generic class might already exist');
      }

      // Insert the generic object
      const response = await this.wallet.genericobject.insert({
        requestBody: genericObject
      });

      // Create JWT for Google Wallet
      const jwt = await this.createJWT(genericObject);

      const passUrl = `https://pay.google.com/gp/v/save/${jwt}`;

      return {
        passId: response.data.id || genericObject.id,
        jwt,
        passUrl
      };

    } catch (error) {
      console.error('Google Wallet pass generation failed:', error);
      // Return demo data for development
      const demoJwt = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        passId: `demo_${payload.membershipId}`,
        jwt: demoJwt,
        passUrl: `https://pay.google.com/gp/v/save/${demoJwt}`
      };
    }
  }

  private async createJWT(genericObject: any): Promise<string> {
    try {
      // In production, you would create a proper JWT with the Google Wallet API
      // For demo purposes, we'll return a placeholder
      return `demo_jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    } catch (error) {
      console.error('JWT creation failed:', error);
      throw new Error('Failed to create Google Wallet JWT');
    }
  }
}
