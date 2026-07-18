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
    await this.sendDeveloperNotify(feedback);

    if (feedback.email) {
      await this.sendThankYou(feedback);
    }
  }

  private async sendDeveloperNotify(feedback: FeedbackRecord): Promise<void> {
    const levelLabel = this.formatLevelLabel(feedback);
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

    await this.sendMail({
      to: this.config.notifyEmail,
      subject,
      text,
    });

    this.logger.info({ feedbackId: feedback.id }, 'feedback notify email sent');
  }

  private async sendThankYou(feedback: FeedbackRecord): Promise<void> {
    const email = feedback.email;
    if (!email) {
      return;
    }

    const levelLabel = this.formatLevelLabel(feedback);
    const subject = 'Thanks for your feedback — My Hand Is A Goose';
    const text = [
      'Hi,',
      '',
      'Thank you for writing in! We have received your feedback.',
      '',
      `Category: ${feedback.category}`,
      `Level: ${levelLabel}`,
      '',
      'Your feedback:',
      feedback.message,
      '',
      'Have fun playing!',
      'The My Hand Is A Goose team',
    ].join('\n');

    await this.sendMail({
      to: email,
      subject,
      text,
    });

    this.logger.info(
      { feedbackId: feedback.id },
      'feedback thank-you email sent',
    );
  }

  private formatLevelLabel(feedback: FeedbackRecord): string {
    return feedback.levelId === undefined ? 'n/a' : String(feedback.levelId);
  }

  private async sendMail(input: {
    to: string;
    subject: string;
    text: string;
  }): Promise<void> {
    const { error } = await this.resend.emails.send({
      to: input.to,
      from: this.config.fromEmail,
      subject: input.subject,
      text: input.text,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
