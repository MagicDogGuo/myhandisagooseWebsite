export type PressAssetDefinition = {
  id: string;
  title: string;
  description: string;
  /** Path under publicAssetBaseUrl, e.g. `/press-kit/press-kit.zip` */
  relativePath: string;
};

export type PressAsset = PressAssetDefinition & {
  downloadCount: number;
};

export type AssetDownloadRecord = {
  assetId: string;
  downloadCount: number;
};
