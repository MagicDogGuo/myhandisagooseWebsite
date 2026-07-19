/**
 * Seed at least one active poll into MongoDB.
 *
 * Usage (from web/backend):
 *   npx tsx scripts/seed-polls.ts
 *
 * Idempotent: skips insert when an active poll already exists.
 */
import { loadConfig } from '../src/config/appConfig.js';
import { connectMongo, disconnectMongo } from '../src/db/mongoose.js';
import { PollsRepository } from '../src/modules/polls/polls-repository.js';

async function main(): Promise<void> {
  const config = loadConfig();
  await connectMongo(config.mongoUri);

  const repository = new PollsRepository();
  const existing = await repository.countActivePolls();
  if (existing > 0) {
    console.log(`skip seed: ${existing} active poll(s) already present`);
    return;
  }

  const poll = await repository.createPoll({
    question: 'What should we add next for My Hand Is A Goose?',
    options: [
      { id: 'patrol', label: 'Patrol officer gameplay' },
      { id: 'bread', label: 'More bread varieties' },
      { id: 'levels', label: 'Extra training levels' },
    ],
    isActive: true,
  });

  console.log(`seeded poll ${poll.id}: ${poll.question}`);
}

main()
  .catch((err) => {
    console.error('seed-polls failed', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await disconnectMongo();
    } catch {
      // ignore disconnect errors on exit
    }
  });
