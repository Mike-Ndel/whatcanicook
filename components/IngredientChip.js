import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { getIngredientEmoji } from '../constants/ingredients';

// A pill representing one selected ingredient, with a tappable × to remove it.
export default function IngredientChip({ name, onRemove }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>
        {getIngredientEmoji(name)} {name}
      </Text>
      <Pressable
        onPress={onRemove}
        hitSlop={10}
        style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${name}`}
      >
        <Text style={styles.removeText}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    borderRadius: 20,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    gap: 6,
  },
  chipText: {
    fontSize: 15,
    color: COLORS.dark,
    fontWeight: '600',
  },
  removeButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,30,30,0.08)',
  },
  removeButtonPressed: {
    backgroundColor: 'rgba(30,30,30,0.16)',
  },
  removeText: {
    fontSize: 16,
    lineHeight: 16,
    color: COLORS.dark,
    fontWeight: '700',
  },
});
