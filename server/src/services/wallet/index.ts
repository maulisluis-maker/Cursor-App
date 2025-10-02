export type WalletPassPayload = {
  memberId: string;
  membershipId: string;
  fullName: string;
  points: number;
  qrData: string;
};

export async function createApplePass(_payload: WalletPassPayload): Promise<{ passId: string; pkpassPath: string }>{
  // TODO: implement using node-passkit / custom signer and provided certificates
  return { passId: `apple_stub_${Date.now()}`, pkpassPath: '/tmp/stub.pkpass' };
}

export async function createGooglePass(_payload: WalletPassPayload): Promise<{ passId: string; jwt: string }>{
  // TODO: implement via Google Wallet REST using service account
  return { passId: `google_stub_${Date.now()}`, jwt: 'stub.jwt.token' };
}
