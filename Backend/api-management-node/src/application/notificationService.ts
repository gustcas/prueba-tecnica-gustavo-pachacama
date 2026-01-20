export class NotificationService {
    sendEmail(to: string, subject: string, payload: Record<string, unknown>) {
        console.log(`[EMAIL MOCK] to=${to} subject=${subject}`, payload);
    }

    sendSms(to: string, message: string) {
        console.log(`[SMS MOCK] to=${to} message=${message}`);
    }
}
