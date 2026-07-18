import { AppError } from '../../errors/app-error.js';
import type { LevelDoc, LevelSummary } from './level-types.js';
import type { LevelsRepository } from './levels-repository.js';

export class LevelsService {
  constructor(private readonly repository: LevelsRepository) {}

  listSummaries(): LevelSummary[] {
    return this.repository.findAll().map((level) => ({
      levelId: level.levelId,
      title: level.title,
      promptEn: level.promptEn,
      trainingFocus: level.trainingFocus,
      screenshots: level.screenshots,
    }));
  }

  getById(levelId: number): LevelDoc {
    const level = this.repository.findById(levelId);
    if (!level) {
      throw new AppError('NOT_FOUND', `Level ${levelId} not found`, 404);
    }
    return level;
  }
}
