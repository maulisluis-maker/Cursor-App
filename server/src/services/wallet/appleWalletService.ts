import { PKPass } from 'passkit-generator';
import fs from 'fs/promises';
import path from 'path';
import { WalletPassPayload, DesignData } from './types';

export class AppleWalletService {
  private certificates: {
    signerCert: Buffer;
    signerKey: Buffer;
    signerKeyPassphrase?: string;
    wwdr: Buffer;
  } | null = null;

  constructor() {
    this.loadCertificates();
  }

  private async loadCertificates() {
    try {
      // In production, these would be loaded from environment variables or secure storage
      // For now, we'll use demo certificates or create placeholder ones
      this.certificates = {
        signerCert: Buffer.from('demo-cert'),
        signerKey: Buffer.from('demo-key'),
        wwdr: Buffer.from('demo-wwdr')
      };
    } catch (error) {
      console.error('Failed to load Apple Wallet certificates:', error);
    }
  }

  async generatePass(
    payload: WalletPassPayload, 
    designData: DesignData
  ): Promise<{ passId: string; pkpassPath: string; passUrl: string }> {
    try {
      if (!this.certificates) {
        throw new Error('Apple Wallet certificates not configured');
      }

      // Create pass data structure
      const passData = {
        formatVersion: 1,
        passTypeIdentifier: 'pass.com.xkys.fitnessstudio',
        serialNumber: payload.membershipId,
        teamIdentifier: 'XKYS123456',
        organizationName: 'XKYS Fitnessstudio',
        description: 'Fitnessstudio Mitgliedskarte',
        logoText: 'XKYS',
        foregroundColor: designData.textColor || '#ffffff',
        backgroundColor: designData.primaryColor || '#1f2937',
        labelColor: designData.secondaryColor || '#374151',
        barcode: {
          message: payload.qrData,
          format: 'PKBarcodeFormatQR',
          messageEncoding: 'iso-8859-1'
        },
        generic: {
          primaryFields: [
            {
              key: 'name',
              label: 'Name',
              value: payload.fullName
            }
          ],
          secondaryFields: [
            {
              key: 'membership',
              label: 'Mitgliedschaft',
              value: 'Premium'
            }
          ],
          auxiliaryFields: [
            {
              key: 'points',
              label: 'Punkte',
              value: payload.points.toString()
            }
          ],
          backFields: [
            {
              key: 'memberId',
              label: 'Mitglieds-ID',
              value: payload.membershipId
            },
            {
              key: 'contact',
              label: 'Kontakt',
              value: 'info@xkys.de'
            }
          ]
        }
      };

      // Create PKPass instance
      const pass = new PKPass(passData, this.certificates);

      // Add custom design elements if available
      if (designData.elements && designData.elements.length > 0) {
        // Note: PKPass doesn't support custom elements directly
        // We would need to create custom pass templates or use web passes
        console.log('Custom design elements detected, using standard pass format');
      }

      // Generate pass buffer
      const passBuffer = await pass.generate();

      // Save to temporary file
      const tempDir = '/tmp/passes';
      await fs.mkdir(tempDir, { recursive: true });
      
      const passId = `apple_${payload.membershipId}_${Date.now()}`;
      const pkpassPath = path.join(tempDir, `${passId}.pkpass`);
      
      await fs.writeFile(pkpassPath, passBuffer);

      const passUrl = `${process.env.BASE_URL || 'http://localhost:4000'}/api/wallet/apple/${payload.membershipId}`;

      return {
        passId,
        pkpassPath,
        passUrl
      };

    } catch (error) {
      console.error('Apple Wallet pass generation failed:', error);
      throw new Error('Failed to generate Apple Wallet pass');
    }
  }

  async getPassFile(membershipId: string): Promise<Buffer> {
    try {
      const tempDir = '/tmp/passes';
      const passFiles = await fs.readdir(tempDir);
      const passFile = passFiles.find(file => 
        file.startsWith(`apple_${membershipId}_`) && file.endsWith('.pkpass')
      );

      if (!passFile) {
        throw new Error('Pass file not found');
      }

      const passPath = path.join(tempDir, passFile);
      return await fs.readFile(passPath);

    } catch (error) {
      console.error('Failed to read Apple Wallet pass file:', error);
      throw new Error('Pass file not available');
    }
  }
}
