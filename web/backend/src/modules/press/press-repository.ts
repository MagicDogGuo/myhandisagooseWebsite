import mongoose, { type InferSchemaType, type Model } from 'mongoose';

import type { AssetDownloadRecord } from './types/index.js';

const assetDownloadSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true, unique: true },
    downloadCount: { type: Number, required: true, default: 0, min: 0 },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    collection: 'asset_downloads',
  },
);

type AssetDownloadDoc = InferSchemaType<typeof assetDownloadSchema> & {
  _id: mongoose.Types.ObjectId;
};

function toRecord(doc: AssetDownloadDoc): AssetDownloadRecord {
  return {
    assetId: doc.assetId,
    downloadCount: doc.downloadCount,
  };
}

export class PressRepository {
  private readonly model: Model<AssetDownloadDoc>;

  constructor(model?: Model<AssetDownloadDoc>) {
    this.model =
      model ??
      (mongoose.models.AssetDownload as Model<AssetDownloadDoc> | undefined) ??
      mongoose.model<AssetDownloadDoc>('AssetDownload', assetDownloadSchema);
  }

  async getCountsByAssetIds(
    assetIds: string[],
  ): Promise<Map<string, number>> {
    if (assetIds.length === 0) {
      return new Map();
    }

    const docs = await this.model
      .find({ assetId: { $in: assetIds } })
      .exec();

    return new Map(
      docs.map((doc) => [doc.assetId, doc.downloadCount] as const),
    );
  }

  async incrementDownloadCount(assetId: string): Promise<AssetDownloadRecord> {
    const doc = await this.model
      .findOneAndUpdate(
        { assetId },
        { $inc: { downloadCount: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();

    if (!doc) {
      throw new Error(`Failed to increment download count for ${assetId}`);
    }

    return toRecord(doc);
  }
}
