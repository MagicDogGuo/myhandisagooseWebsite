import mongoose, { type InferSchemaType, type Model } from 'mongoose';

import { AppError } from '../../errors/app-error.js';
import type {
  CastVoteInput,
  PollOption,
  PollRecord,
  VoteRecord,
} from './types/index.js';

const pollOptionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false },
);

const pollSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [pollOptionSchema],
      required: true,
      validate: {
        validator: (options: PollOption[]) =>
          Array.isArray(options) && options.length >= 2,
        message: 'Poll must have at least 2 options',
      },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'polls',
  },
);

const voteSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
    },
    optionId: { type: String, required: true },
    voterToken: { type: String, required: true },
    ipHash: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'votes',
  },
);

voteSchema.index({ pollId: 1, voterToken: 1 }, { unique: true });
voteSchema.index({ pollId: 1, optionId: 1 });

type PollDoc = InferSchemaType<typeof pollSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

type VoteDoc = InferSchemaType<typeof voteSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

function toPollRecord(doc: PollDoc): PollRecord {
  return {
    id: doc._id.toString(),
    question: doc.question,
    options: doc.options.map((option) => ({
      id: option.id,
      label: option.label,
    })),
    isActive: doc.isActive,
    createdAt: doc.createdAt,
  };
}

function toVoteRecord(doc: VoteDoc): VoteRecord {
  return {
    id: doc._id.toString(),
    pollId: doc.pollId.toString(),
    optionId: doc.optionId,
    voterToken: doc.voterToken,
    ipHash: doc.ipHash,
    createdAt: doc.createdAt,
  };
}

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: number }).code === 11000
  );
}

export type CreatePollInput = {
  question: string;
  options: PollOption[];
  isActive?: boolean;
};

export class PollsRepository {
  private readonly pollModel: Model<PollDoc>;
  private readonly voteModel: Model<VoteDoc>;

  constructor(
    pollModel?: Model<PollDoc>,
    voteModel?: Model<VoteDoc>,
  ) {
    this.pollModel =
      pollModel ??
      (mongoose.models.Poll as Model<PollDoc> | undefined) ??
      mongoose.model<PollDoc>('Poll', pollSchema);
    this.voteModel =
      voteModel ??
      (mongoose.models.Vote as Model<VoteDoc> | undefined) ??
      mongoose.model<VoteDoc>('Vote', voteSchema);
  }

  async listActivePolls(): Promise<PollRecord[]> {
    const docs = await this.pollModel
      .find({ isActive: true })
      .sort({ createdAt: 1 })
      .exec();
    return docs.map(toPollRecord);
  }

  async findPollById(pollId: string): Promise<PollRecord | null> {
    if (!mongoose.isValidObjectId(pollId)) {
      return null;
    }
    const doc = await this.pollModel.findById(pollId).exec();
    return doc ? toPollRecord(doc) : null;
  }

  async countVotesByOption(
    pollId: string,
  ): Promise<Map<string, number>> {
    if (!mongoose.isValidObjectId(pollId)) {
      return new Map();
    }

    const rows = await this.voteModel
      .aggregate<{ _id: string; count: number }>([
        { $match: { pollId: new mongoose.Types.ObjectId(pollId) } },
        { $group: { _id: '$optionId', count: { $sum: 1 } } },
      ])
      .exec();

    return new Map(rows.map((row) => [row._id, row.count]));
  }

  async findVoteByPollAndToken(
    pollId: string,
    voterToken: string,
  ): Promise<VoteRecord | null> {
    if (!mongoose.isValidObjectId(pollId)) {
      return null;
    }
    const doc = await this.voteModel
      .findOne({
        pollId: new mongoose.Types.ObjectId(pollId),
        voterToken,
      })
      .exec();
    return doc ? toVoteRecord(doc) : null;
  }

  async createVote(input: CastVoteInput): Promise<VoteRecord> {
    try {
      const doc = await this.voteModel.create({
        pollId: new mongoose.Types.ObjectId(input.pollId),
        optionId: input.optionId,
        voterToken: input.voterToken,
        ipHash: input.ipHash,
      });
      return toVoteRecord(doc);
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        throw new AppError('ALREADY_VOTED', 'Already voted on this poll', 409);
      }
      throw err;
    }
  }

  async createPoll(input: CreatePollInput): Promise<PollRecord> {
    const doc = await this.pollModel.create({
      question: input.question,
      options: input.options,
      isActive: input.isActive ?? true,
    });
    return toPollRecord(doc);
  }

  async countActivePolls(): Promise<number> {
    return this.pollModel.countDocuments({ isActive: true }).exec();
  }
}
