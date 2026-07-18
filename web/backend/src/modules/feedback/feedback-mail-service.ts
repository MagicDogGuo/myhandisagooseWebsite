import sgMail from '@sendgrid/mail';
import type { Logger } from 'pino';

import type { FeedbackRecord } from './types/index.js';

export type FeedbackMailConfig = {
  apiKey: string;
  fromEmail: string;
  notifyEmail: string;
};

export class FeedbackMailService {
  constructor(
    private readonly config: FeedbackMailConfig,
    private readonly logger: Logger,
  ) {
    sgMail.setApiKey(config.apiKey);
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

    await sgMail.send({
      to: this.config.notifyEmail,
      from: this.config.fromEmail,
      subject,
      text,
    });

    this.logger.info({ feedbackId: feedback.id }, 'feedback notify email sent');
  }
}
