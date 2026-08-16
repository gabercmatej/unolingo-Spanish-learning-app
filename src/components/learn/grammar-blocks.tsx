import { ScrollView, StyleSheet, View } from 'react-native';

import { SpeakIcon } from '@/components/exercises/audio-button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { ExampleLine, GrammarBlock } from '@/content/types';
import { useTheme } from '@/hooks/use-theme';

/**
 * Renders the structured grammar format. Keeping explanations as data rather
 * than JSX means a new grammar card is a content edit, and every card in the
 * app looks consistent without anyone re-styling anything.
 */
export function GrammarBlocks({ blocks }: { blocks: GrammarBlock[] }) {
  return (
    <View style={styles.stack}>
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </View>
  );
}

function BlockView({ block }: { block: GrammarBlock }) {
  const theme = useTheme();

  switch (block.type) {
    case 'text':
      return (
        <Text variant="body" color="textSecondary">
          {block.text}
        </Text>
      );

    case 'rule':
      return (
        <View style={[styles.rule, { backgroundColor: toneSoft(theme, block.tone) }]}>
          <View style={[styles.ruleTag, { backgroundColor: toneColor(theme, block.tone) }]}>
            <Text variant="caption" tone={theme.onTint}>
              {block.label}
            </Text>
          </View>
          <Text variant="body">{block.text}</Text>
        </View>
      );

    case 'contrast':
      return (
        <View style={styles.contrast}>
          <ContrastCard side={block.left} />
          <ContrastCard side={block.right} />
        </View>
      );

    case 'table':
      return <GrammarTable head={block.head} rows={block.rows} />;

    case 'examples':
      return (
        <View style={styles.stack}>
          {block.items.map((item, index) => (
            <ExampleRow key={index} example={item} />
          ))}
        </View>
      );

    case 'tip':
      return (
        <View style={[styles.callout, { backgroundColor: theme.accentSoft }]}>
          <Icon name="bulb-outline" size={16} tone={theme.accentText} />
          <Text variant="small" tone={theme.accentText} style={styles.flex}>
            {block.text}
          </Text>
        </View>
      );

    case 'warning':
      return (
        <View style={[styles.callout, { backgroundColor: theme.dangerSoft }]}>
          <Icon name="alert-circle-outline" size={16} tone={theme.dangerText} />
          <Text variant="small" tone={theme.dangerText} style={styles.flex}>
            {block.text}
          </Text>
        </View>
      );

    default:
      return null;
  }
}

function ContrastCard({ side }: { side: NonNullable<Extract<GrammarBlock, { type: 'contrast' }>['left']> }) {
  const theme = useTheme();
  const tone = toneColor(theme, side.tone);

  return (
    <View style={[styles.contrastCard, { backgroundColor: toneSoft(theme, side.tone) }]}>
      <Text variant="subheading" tone={tone}>
        {side.title}
      </Text>
      <Text variant="caption" color="textSecondary">
        {side.caption}
      </Text>
      <View style={styles.contrastExamples}>
        {side.examples.map((example, index) => (
          <View key={index} style={styles.gapSmall}>
            <Text variant="smallBold">{example.es}</Text>
            <Text variant="caption" color="textSecondary">
              {example.en}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function GrammarTable({ head, rows }: { head: string[]; rows: string[][] }) {
  const theme = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.table, { borderColor: theme.border }]}>
        <View style={[styles.tableRow, { backgroundColor: theme.backgroundSunken }]}>
          {head.map((cell, index) => (
            <View key={index} style={styles.tableCell}>
              <Text variant="overline" color="textTertiary">
                {cell.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
        {rows.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={[
              styles.tableRow,
              rowIndex < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
            ]}>
            {row.map((cell, cellIndex) => (
              <View key={cellIndex} style={styles.tableCell}>
                <Text
                  variant={cellIndex === 0 ? 'caption' : 'smallBold'}
                  color={cellIndex === 0 ? 'textTertiary' : 'text'}>
                  {cell}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export function ExampleRow({ example, showAudio = true }: { example: ExampleLine; showAudio?: boolean }) {
  const theme = useTheme();

  return (
    <View style={[styles.example, { backgroundColor: theme.backgroundSunken }]}>
      <View style={styles.exampleTop}>
        <Text variant="esSmall" style={styles.flex}>
          {highlight(example.es, example.highlight, theme.tint)}
        </Text>
        {showAudio ? <SpeakIcon text={example.es} /> : null}
      </View>
      <Text variant="small" color="textSecondary">
        {example.en}
      </Text>
      {example.note ? (
        <Text variant="caption" color="textTertiary">
          {example.note}
        </Text>
      ) : null}
    </View>
  );
}

/** Splits a sentence so the highlighted fragments can be tinted. */
function highlight(text: string, fragments: string[] | undefined, tone: string) {
  if (!fragments || fragments.length === 0) return text;

  const pattern = fragments
    .map((fragment) => fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const parts = text.split(new RegExp(`(${pattern})`, 'g'));

  return parts.map((part, index) =>
    fragments.includes(part) ? (
      <Text key={index} variant="esSmall" tone={tone}>
        {part}
      </Text>
    ) : (
      part
    ),
  );
}

function toneColor(theme: ReturnType<typeof useTheme>, tone?: string): string {
  switch (tone) {
    case 'success':
      return theme.success;
    case 'danger':
      return theme.danger;
    case 'listening':
      return theme.listening;
    case 'accent':
      return theme.accentText;
    case 'grammar':
    default:
      return theme.grammar;
  }
}

function toneSoft(theme: ReturnType<typeof useTheme>, tone?: string): string {
  switch (tone) {
    case 'success':
      return theme.successSoft;
    case 'danger':
      return theme.dangerSoft;
    case 'listening':
      return theme.listeningSoft;
    case 'accent':
      return theme.accentSoft;
    case 'grammar':
    default:
      return theme.grammarSoft;
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stack: { gap: Spacing.four },
  gapSmall: { gap: 2 },
  rule: { gap: Spacing.two, padding: Spacing.four, borderRadius: Radius.md, alignItems: 'flex-start' },
  ruleTag: { paddingVertical: 3, paddingHorizontal: Spacing.two, borderRadius: Radius.full },
  contrast: { flexDirection: 'row', gap: Spacing.three },
  contrastCard: {
    flex: 1,
    gap: Spacing.one,
    padding: Spacing.four,
    borderRadius: Radius.md,
  },
  contrastExamples: { gap: Spacing.three, marginTop: Spacing.two },
  callout: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'flex-start',
  },
  table: { borderWidth: 1, borderRadius: Radius.md, overflow: 'hidden', minWidth: '100%' },
  tableRow: { flexDirection: 'row' },
  tableCell: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.four, minWidth: 96 },
  example: { gap: 2, padding: Spacing.three, borderRadius: Radius.sm },
  exampleTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
