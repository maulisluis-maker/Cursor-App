import { AppleWalletService } from './appleWalletService';
import { GoogleWalletServiceReal } from './googleWalletServiceReal';
import { WalletPassPayload, DesignData, WalletPassResult } from './types';
import QRCode from 'qrcode';

export class WalletService {
  private appleWalletService: AppleWalletService;
  private googleWalletService: GoogleWalletServiceReal;

  constructor() {
    this.appleWalletService = new AppleWalletService();
    this.googleWalletService = new GoogleWalletServiceReal();
  }

  async generateWalletPass(
    payload: WalletPassPayload,
    designData: DesignData,
    walletType: 'apple' | 'google'
  ): Promise<WalletPassResult> {
    try {
      // Generate QR code data
      const qrData = await this.generateQRCode(payload);

      const enhancedPayload = {
        ...payload,
        qrData
      };

      let result: any;

      if (walletType === 'apple') {
        const appleResult = await this.appleWalletService.generatePass(enhancedPayload, designData);
        result = {
          ...appleResult,
          passType: 'apple' as const
        };
      } else {
        const googleResult = await this.googleWalletService.generatePass(enhancedPayload, designData);
        result = {
          ...googleResult,
          passType: 'google' as const
        };
      }

      return {
        success: true,
        passId: result.passId,
        passUrl: result.passUrl,
        passType: result.passType,
        memberId: payload.membershipId,
        memberName: payload.fullName,
        message: `${walletType === 'apple' ? 'Apple Wallet' : 'Google Wallet'} Pass erfolgreich generiert`
      };

    } catch (error) {
      console.error(`Wallet pass generation failed (${walletType}):`, error);
      return {
        success: false,
        passId: '',
        passUrl: '',
        passType: walletType,
        memberId: payload.membershipId,
        memberName: payload.fullName,
        message: `Fehler bei der ${walletType === 'apple' ? 'Apple Wallet' : 'Google Wallet'} Pass-Generierung`
      };
    }
  }

  private async generateQRCode(payload: WalletPassPayload): Promise<string> {
    try {
      // Create QR code data with member information
      const qrData = {
        type: 'fitnessstudio_member',
        memberId: payload.membershipId,
        timestamp: Date.now(),
        points: payload.points,
        name: payload.fullName
      };

      return await QRCode.toDataURL(JSON.stringify(qrData));
    } catch (error) {
      console.error('QR code generation failed:', error);
      return `member:${payload.membershipId}`;
    }
  }

  async getApplePassFile(membershipId: string): Promise<Buffer> {
    return await this.appleWalletService.getPassFile(membershipId);
  }

  async getGooglePassJWT(membershipId: string): Promise<string> {
    // This would return the JWT for Google Wallet
    // For demo purposes, return a placeholder
    return `demo_jwt_${membershipId}_${Date.now()}`;
  }
}
