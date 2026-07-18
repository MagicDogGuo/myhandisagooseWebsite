import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import matter from 'gray-matter';
import { z } from 'zod';

import { AppError } from '../../errors/app-error.js';
import type { LevelDoc } from './types/index.js';

const pitfallSchema = z.object({
  title: z.string().min(1),
  detail: z.string().min(1),
});

const levelFrontMatterSchema = z.object({
  title: z.string().min(1),
  promptEn: z.string().min(1),
  trainingFocus: z.array(z.string().min(1)).min(1),
  pitfalls: z.array(pitfallSchema).default([]),
  screenshots: z.array(z.string().min(1)).default([]),
});

const LEVEL_FILE_PATTERN = /^level-(\d+)\.md$/;

function resolveContentDir(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), 'content');
}

function parseLevelFile(filePath: string, levelId: number): LevelDoc {
  const raw = readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const parsed = levelFrontMatterSchema.safeParse(data);

  if (!parsed.success) {
    throw new AppError(
      'INTERNAL',
      `Invalid front-matter in level-${levelId}.md`,
      500,
      false,
      parsed.error.flatten(),
    );
  }

  return {
    levelId,
    title: parsed.data.title,
    promptEn: parsed.data.promptEn,
    trainingFocus: parsed.data.trainingFocus,
    screenshots: parsed.data.screenshots,
    bodyMd: content.trim(),
    pitfalls: parsed.data.pitfalls,
  };
}

export class LevelsRepository {
  private readonly contentDir: string;
  private cache: Map<number, LevelDoc> | null = null;

  constructor(contentDir = resolveContentDir()) {
    this.contentDir = contentDir;
  }

  findAll(): LevelDoc[] {
    return [...this.loadAll().values()].sort((a, b) => a.levelId - b.levelId);
  }

  findById(levelId: number): LevelDoc | null {
    return this.loadAll().get(levelId) ?? null;
  }

  private loadAll(): Map<number, LevelDoc> {
    if (this.cache) {
      return this.cache;
    }

    const levels = new Map<number, LevelDoc>();
    const files = readdirSync(this.contentDir).filter((name) =>
      LEVEL_FILE_PATTERN.test(name),
    );

    for (const fileName of files) {
      const match = LEVEL_FILE_PATTERN.exec(fileName);
      if (!match) {
        continue;
      }
      const levelId = Number(match[1]);
      const filePath = path.join(this.contentDir, fileName);
      levels.set(levelId, parseLevelFile(filePath, levelId));
    }

    this.cache = levels;
    return levels;
  }
}
