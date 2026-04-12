// SMS service integration (using your preferred provider - Twilio, Africastalking, etc.)

export async function sendOTP(phoneNumber: string, otp: string): Promise<void> {
  // This is a placeholder - integrate with your SMS provider
  // Example with Twilio:
  // const client = twilio(accountSid, authToken);
  // await client.messages.create({
  //   body: `Your OTP is: ${otp}. Valid for 10 minutes.`,
  //   from: '+1234567890',
  //   to: phoneNumber,
  // });

  console.log(`[SMS] Sending OTP to ${phoneNumber}: ${otp}`);

  // For development, just log it
  // In production, replace with actual SMS service
}

export async function sendAlert(phoneNumber: string, message: string): Promise<void> {
  console.log(`[SMS Alert] ${phoneNumber}: ${message}`);
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