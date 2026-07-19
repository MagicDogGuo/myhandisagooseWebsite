import type { Logger } from 'pino';
import pino from 'pino';

import type { AppControllers } from '../app.js';
import { FeedbackController } from '../modules/feedback/feedback-controller.js';
import type { FeedbackMailService } from '../modules/feedback/feedback-mail-service.js';
import type { FeedbackRepository } from '../modules/feedback/feedback-repository.js';
import { FeedbackService } from '../modules/feedback/feedback-service.js';
import type {
  CreateFeedbackInput,
  FeedbackRecord,
} from '../modules/feedback/types/index.js';
import { HealthController } from '../modules/health/health-controller.js';
import { LevelsController } from '../modules/levels/levels-controller.js';
import { LevelsRepository } from '../modules/levels/levels-repository.js';
import { LevelsService } from '../modules/levels/levels-service.js';
import { PollsController } from '../modules/polls/polls-controller.js';
import type { PollsService } from '../modules/polls/polls-service.js';
import type { PollResult } from '../modules/polls/types/index.js';
import { VoteGuard } from '../modules/polls/vote-guard.js';
import { PressController } from '../modules/press/press-controller.js';
import type { PressService } from '../modules/press/press-service.js';
import type { PressAsset } from '../modules/press/types/index.js';
import { createTestConfig } from './test-config.js';

export type FeedbackTestDoubles = {
  repository?: Pick<FeedbackRepository, 'create'>;
  mailService?: Pick<FeedbackMailService, 'notify'>;
};

export type PollsTestDoubles = {
  service?: Pick<PollsService, 'listPolls' | 'castVote'>;
  voteGuard?: VoteGuard;
};

export type PressTestDoubles = {
  service?: Pick<PressService, 'listAssets' | 'recordDownload'>;
};

export function createSilentLogger(): Logger {
  return pino({ level: 'silent' });
}

const defaultPoll: PollResult = {
  id: 'poll-1',
  question: 'What next?',
  options: [
    { id: 'patrol', label: 'Patrol', voteCount: 0 },
    { id: 'bread', label: 'Bread', voteCount: 0 },
  ],
  totalVotes: 0,
  myVote: null,
};

const defaultPressAssets: PressAsset[] = [
  {
    id: 'press-kit',
    title: 'Press Kit',
    description: 'Logos, screenshots, and promo art for media coverage.',
    relativePath: '/press-kit/press-kit.zip',
    downloadCount: 0,
  },
];

export function createTestControllers(
  overrides: Partial<AppControllers> = {},
  doubles: FeedbackTestDoubles & {
    polls?: PollsTestDoubles;
    press?: PressTestDoubles;
  } = {},
): AppControllers {
  const logger = createSilentLogger();
  const config = createTestConfig();
  const levelsService = new LevelsService(new LevelsRepository());

  const repository: Pick<FeedbackRepository, 'create'> = doubles.repository ?? {
    create: async (input: CreateFeedbackInput): Promise<FeedbackRecord> => ({
      id: 'test-feedback-id',
      category: input.category,
      ...(input.levelId !== undefined ? { levelId: input.levelId } : {}),
      message: input.message,
      ...(input.email ? { email: input.email } : {}),
      createdAt: new Date(),
    }),
  };

  const mailService: Pick<FeedbackMailService, 'notify'> =
    doubles.mailService ?? {
      notify: async () => undefined,
    };

  const feedbackService = new FeedbackService(
    repository as FeedbackRepository,
    mailService as FeedbackMailService,
    logger,
  );

  const voteGuard =
    doubles.polls?.voteGuard ?? new VoteGuard(config.vote);

  const pollsService: Pick<PollsService, 'listPolls' | 'castVote'> =
    doubles.polls?.service ?? {
      listPolls: async () => [defaultPoll],
      castVote: async (params) => ({
        ...defaultPoll,
        id: params.pollId,
        myVote: params.optionId,
        totalVotes: 1,
        options: defaultPoll.options.map((option) =>
          option.id === params.optionId
            ? { ...option, voteCount: 1 }
            : option,
        ),
      }),
    };

  const pressService: Pick<PressService, 'listAssets' | 'recordDownload'> =
    doubles.press?.service ?? {
      listAssets: async () => defaultPressAssets,
      recordDownload: async (assetId) => ({
        redirectUrl: `${config.publicAssetBaseUrl}/press-kit/${assetId}.zip`,
      }),
    };

  return {
    health: new HealthController(),
    levels: new LevelsController(levelsService),
    feedback: new FeedbackController(feedbackService),
    polls: new PollsController(
      pollsService as PollsService,
      voteGuard,
      config.nodeEnv,
    ),
    press: new PressController(pressService as PressService),
    ...overrides,
  };
}
