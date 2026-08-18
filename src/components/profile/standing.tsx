import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CefrLevel } from '@/content/types';
import type { ProficiencyEstimate } from '@/learning/mastery';
import type { Rank } from '@/learning/ranks';
import type { Skill } from '@/learning/types';

const SKILL_LABEL: Record<Skill, string> = {
  vocabulary: 'vocabulary',
  grammar: 'grammar',
  listening: 'listening',
  production: 'production',
};

/**
 * Three different things, and only one of them is praise. "Nothing is holding
 * you back" and "we have not measured you yet" produce the same empty
 * `heldBackBy`, so a new learner was being told their A0 was demonstrated across
 * every skill on the evidence of four exercises.
 */
function proficiencyCaption(estimate: ProficiencyEstimate): string {
  if (estimate.heldBackBy.length > 0) {
    return `Held back by ${joinSkills(estimate.heldBackBy)} — the words are there, the evidence is not`;
  }
  if (!estimate.measured) return 'Not measured yet — a few more sessions will settle it';
  return 'Demonstrated across every skill';
}

/** Reads "listening", "listening and production" — never "listening, production". */
function joinSkills(skills: Skill[]): string {
  const names = skills.map((skill) => SKILL_LABEL[skill]);
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

interface Props {
  rank: Rank;
  /** Highest stage finished end to end, or null if none is yet. */
  curriculum: CefrLevel | null;
  proficiency: ProficiencyEstimate;
}

/**
 * Three measures of the same learner, deliberately shown together and
 * deliberately allowed to disagree.
 *
 * Rank is distance walked. Curriculum is how much of the course is behind you.
 * Proficiency is what you have actually demonstrated — and it is the only one of
 * the three you cannot earn by turning up, because it is gated on having done
 * the listening and production, not merely on knowing the words.
 *
 * A single number would have to pick one of these and pretend it was all three.
 * Showing "B1 curriculum complete · proficiency A2+, held back by listening" is
 * both more honest and more useful: it names the thing to go and do.
 */
export function Standing({ rank, curriculum, proficiency }: Props) {
  const theme = useTheme();
  const rankTone = theme[rank.tone] as string;

  const rows: { icon: IconName; tone: string; label: string; value: string; caption: string }[] = [
    {
      icon: rank.icon as IconName,
      tone: rankTone,
      label: 'Rank',
      value: rank.name,
      caption: 'How far you have walked',
    },
    {
      icon: 'map-outline',
      tone: theme.conversation as string,
      label: 'Curriculum',
      value: curriculum ? `${curriculum} complete` : 'In progress',
      caption: curriculum ? 'Every unit of that stage finished' : 'No stage finished end to end yet',
    },
    {
      icon: 'ribbon-outline',
      tone: theme.listening as string,
      label: 'Proficiency',
      value: `${proficiency.level}${proficiency.plus ? '+' : ''}`,
      caption: proficiencyCaption(proficiency),
    },
  ];

  return (
    <View style={styles.rows}>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <View style={[styles.badge, { backgroundColor: `${row.tone}1F` }]}>
            <Icon name={row.icon} size={17} tone={row.tone} />
          </View>
          <View style={styles.flex}>
            <View style={styles.valueLine}>
              <Text variant="caption" color="textTertiary">
                {row.label}
              </Text>
              <Text variant="bodyBold" numeric style={styles.flex} numberOfLines={1}>
                {row.value}
              </Text>
            </View>
            <Text variant="caption" color="textSecondary">
              {row.caption}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rows: { gap: Spacing.four },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  badge: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Without minWidth: 0 a long caption pushes the badge off the card on web.
  flex: { flex: 1, minWidth: 0 },
  valueLine: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
});
