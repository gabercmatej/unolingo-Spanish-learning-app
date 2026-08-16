import { router } from 'expo-router';

/**
 * Going back is only safe when there is somewhere to go back *to*. Deep links,
 * a web reload inside a session, or opening a word from a notification all
 * produce an empty history — in which case we land on Learn rather than
 * silently doing nothing.
 */
export function goBack(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)');
}
