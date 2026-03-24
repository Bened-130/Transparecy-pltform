// services/sms-service/src/safaricom.ts
interface OTPConfig {
  nationalId: string;
  phoneNumber: string;
  stationId: string;
  userType: 'PO' | 'DPO';
}

export class SafaricomSMSService {
  async sendOTP(config: OTPConfig): Promise<void> {
    const otp = this.generateSecureOTP();
    const message = `IEBC Verification Code: ${otp}. Valid for 15 minutes. Do not share. Station: ${config.stationId}`;
    
    // Store hashed OTP
    await this.storeOTPHash(config, otp);
    
    // Send via Safaricom Daraja API
    await this.darajaClient.sendSMS({
      to: config.phoneNumber,
      message,
      senderId: 'IEBC-OTP'
    });
  }
  
  private generateSecureOTP(): string {
    // Cryptographically secure 6-digit OTP
    return crypto.randomInt(100000, 999999).toString();
  }
}