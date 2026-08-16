import { router } from 'expo-router';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/layout';
import { Screen } from '@/components/ui/screen';

export default function NotFoundScreen() {
  return (
    <Screen tabBarPadding={false}>
      <EmptyState
        icon="compass-outline"
        title="Nada por aquí"
        message="That screen doesn’t exist. Nothing lost — head back to your lessons."
        action={<Button title="Back to Learn" onPress={() => router.replace('/(tabs)')} full={false} />}
      />
    </Screen>
  );
}
