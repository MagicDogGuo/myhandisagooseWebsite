import mongoose, { type InferSchemaType, type Model } from 'mongoose';

import type { CreateFeedbackInput, FeedbackRecord } from './types/index.js';

const feedbackSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['bug', 'suggestion', 'other'],
      required: true,
    },
    levelId: { type: Number, min: 0, max: 7 },
    message: { type: String, required: true, maxlength: 2000 },
    email: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'feedbacks',
  },
);

type FeedbackDoc = InferSchemaType<typeof feedbackSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

function toRecord(doc: FeedbackDoc): FeedbackRecord {
  return {
    id: doc._id.toString(),
    category: doc.category as FeedbackRecord['category'],
    ...(doc.levelId !== undefined && doc.levelId !== null
      ? { levelId: doc.levelId }
      : {}),
    message: doc.message,
    ...(doc.email ? { email: doc.email } : {}),
    createdAt: doc.createdAt,
  };
}

export class FeedbackRepository {
  private readonly model: Model<FeedbackDoc>;

  constructor(model?: Model<FeedbackDoc>) {
    this.model =
      model ??
      (mongoose.models.Feedback as Model<FeedbackDoc> | undefined) ??
      mongoose.model<FeedbackDoc>('Feedback', feedbackSchema);
  }

  async create(input: CreateFeedbackInput): Promise<FeedbackRecord> {
    const doc = await this.model.create({
      category: input.category,
      ...(input.levelId !== undefined ? { levelId: input.levelId } : {}),
      message: input.message,
      ...(input.email ? { email: input.email } : {}),
    });
    return toRecord(doc);
  }
}
