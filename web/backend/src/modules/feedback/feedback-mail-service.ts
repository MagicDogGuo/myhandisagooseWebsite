import type { Logger } from 'pino';
import { Resend } from 'resend';

import type { FeedbackRecord } from './types/index.js';

export type FeedbackMailConfig = {
  apiKey: string;
  fromEmail: string;
  notifyEmail: string;
};

export class FeedbackMailService {
  private readonly resend: Resend;

  constructor(
    private readonly config: FeedbackMailConfig,
    private readonly logger: Logger,
  ) {
    this.resend = new Resend(config.apiKey);
  }

  async notify(feedback: FeedbackRecord): Promise<void> {
    const levelLabel =
      feedback.levelId === undefined ? 'n/a' : String(feedback.levelId);
    const subject = `[Goose Feedback] ${feedback.category} (level ${levelLabel})`;
    const text = [
      `Category: ${feedback.category}`,
      `Level: ${levelLabel}`,
      `Feedback id: ${feedback.id}`,
      '',
      feedback.message,
      '',
      feedback.email ? 'Contact email: (provided)' : 'Contact email: (none)',
    ].join('\n');

    const { error } = await this.resend.emails.send({
      to: this.config.notifyEmail,
      from: this.config.fromEmail,
      subject,
      text,
    });

    if (error) {
      throw new Error(error.message);
    }

    this.logger.info({ feedbackId: feedback.id }, 'feedback notify email sent');
  }
}
