import { fetchNui, isEnvBrowser } from 'lsx-ui';

/**
 * Ask a SCRIPT something, from inside lsx_lib's panel.
 *
 * Everything in Script Studio renders in lsx_lib's NUI frame, so a plain
 * `fetchNui` posts to `https://lsx_lib/...` no matter which script the screen
 * is about. A callback registered by example_fishing is simply never reached -
 * and because fetchNui answers a failed fetch with its mock data, that failure
 * looks exactly like success.
 *
 * So the request goes to lsx_lib's relay, which forwards it to the named
 * server callback after checking the name belongs to that resource. The
 * answering script does its own permission check; the relay grants nothing.
 *
 * The same bridge a script's own custom pages use - see nuiBridge.lua.
 */
export async function studioRequest<T>(
  resource: string,
  callback: string,
  payload?: unknown,
): Promise<T> {
  if (isEnvBrowser()) throw new Error('BrowserPreview');

  const reply = await fetchNui<{ success: boolean; data?: T; _error?: string }>(
    'STUDIO_REQUEST',
    // Prefixed here rather than in every schema: `x-validateWith` and
    // `x-action` name a callback ON their own script, and saying so twice is
    // one more thing to get wrong.
    { resource, callback: `${resource}:${callback}`, payload },
  );

  if (!reply?.success) throw new Error(reply?._error ?? 'NoAnswer');
  return reply.data as T;
}
