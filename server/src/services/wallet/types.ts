export interface WalletPassPayload {
  memberId: string;
  membershipId: string;
  fullName: string;
  email: string;
  points: number;
  qrData: string;
}

export interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'logo';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  zIndex: number;
  isSelected: boolean;
}

export interface DesignData {
  cardTitle: string;
  cardSubtitle: string;
  primaryColor: string;
  secondaryColor: string;
  primaryColorEnabled: boolean;
  secondaryColorEnabled: boolean;
  textColor: string;
  textColorEnabled: boolean;
  textStyle: string;
  textSize: string;
  shadow: boolean;
  glow: boolean;
  glowColor: string;
  glowIntensity: number;
  layout: string;
  layers: {
    logo: boolean;
    title: boolean;
    subtitle: boolean;
  };
  elements: DesignElement[];
  backgroundImage?: string;
}

export interface WalletPassResult {
  success: boolean;
  passId: string;
  passUrl: string;
  passType: 'apple' | 'google';
  memberId: string;
  memberName: string;
  message: string;
}
