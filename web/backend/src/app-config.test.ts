import { describe, expect, it, vi } from 'vitest';

describe('loadConfig', () => {
  it('exits with code 1 when required env is missing', async () => {
    vi.resetModules();
    vi.stubEnv('MONGO_URI', '');
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('RESEND_FROM_EMAIL', '');
    vi.stubEnv('FEEDBACK_NOTIFY_EMAIL', '');
    vi.stubEnv('VOTE_IP_HASH_SECRET', '');
    vi.stubEnv('META_APP_ID', '');
    vi.stubEnv('OCULUS_GRAPH_ACCESS_TOKEN', '');
    vi.stubEnv('OCULUS_GRAPH_DOC_ID', '');

    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as never);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { loadConfig } = await import('./config/appConfig.js');
    loadConfig();

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();

    exitSpy.mockRestore();
    errorSpy.mockRestore();
    vi.unstubAllEnvs();
  });
});
