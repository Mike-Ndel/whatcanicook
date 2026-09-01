import { Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { getIngredientEmoji } from '../constants/ingredients';

// A tappable suggestion pill. Disabled visual state when already selected,
// so users get feedback instead of silently doing nothing.
export default function SuggestedIngredient({ name, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={selected}
      style={({ pressed }) => [
        styles.pill,
        selected && styles.pillSelected,
        pressed && !selected && styles.pillPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={selected ? `${name}, already added` : `Add ${name}`}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
        {getIngredientEmoji(name)} {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pillPressed: {
    backgroundColor: COLORS.background,
  },
  pillSelected: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.chipBorder,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  pillTextSelected: {
    color: COLORS.textSecondary,
  },
});
