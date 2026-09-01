import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

// Controlled text input paired with an "Add" button.
// Pressing the keyboard's "Done" key also triggers onAdd (via onSubmitEditing).
export default function IngredientInput({ value, onChangeText, onAdd }) {
  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Enter an ingredient..."
        placeholderTextColor={COLORS.textSecondary}
        returnKeyType="done"
        onSubmitEditing={onAdd}
        autoCapitalize="words"
        autoCorrect={false}
        accessibilityLabel="Ingredient name input"
        accessibilityHint="Type an ingredient you have, then press Add or Done"
      />
      <Pressable
        onPress={onAdd}
        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Add ingredient"
      >
        <Text style={styles.addButtonText}>+ Add</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.dark,
    minHeight: 50,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  addButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },
  addButtonText: {
    color: COLORS.dark,
    fontSize: 15,
    fontWeight: '700',
  },
});
