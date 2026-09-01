import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { SUGGESTED_INGREDIENTS } from '../constants/ingredients';
import IngredientInput from '../components/IngredientInput';
import IngredientChip from '../components/IngredientChip';
import SuggestedIngredient from '../components/SuggestedIngredient';

// Capitalizes the first letter for display, e.g. "plantain" -> "Plantain".
function formatIngredientName(raw) {
  const trimmed = raw.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export default function HomeScreen() {
  const [inputValue, setInputValue] = useState('');
  const [ingredients, setIngredients] = useState([]);

  // Adds an ingredient if it's non-empty and not already in the list
  // (case-insensitive duplicate check).
  function addIngredient(rawName) {
    const trimmed = rawName.trim();
    if (!trimmed) return;

    const alreadyAdded = ingredients.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadyAdded) {
      setInputValue('');
      return;
    }

    setIngredients((prev) => [...prev, formatIngredientName(trimmed)]);
    setInputValue('');
  }

  function handleAddFromInput() {
    addIngredient(inputValue);
  }

  function handleQuickAdd(name) {
    addIngredient(name);
  }

  function removeIngredient(name) {
    setIngredients((prev) => prev.filter((item) => item !== name));
  }

  function clearAllIngredients() {
    setIngredients([]);
  }

  function handleFindRecipes() {
    if (ingredients.length === 0) {
      Alert.alert('Add some ingredients first', 'Tell us what you have so we know what to cook.');
      return;
    }
    Alert.alert('Coming soon', 'Recipe matching will be available soon.');
  }

  const isSelected = (name) =>
    ingredients.some((item) => item.toLowerCase() === name.toLowerCase());

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logoEmoji}>🍳</Text>
            <Text style={styles.title}>WhatCanICook?</Text>
            <Text style={styles.tagline}>Cook something delicious with what you already have.</Text>
          </View>

          {/* Main input section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>What's in your kitchen?</Text>
            <Text style={styles.sectionSubtitle}>
              Add the ingredients you have and we'll help you figure out what to cook.
            </Text>

            <View style={styles.inputSpacing}>
              <IngredientInput
                value={inputValue}
                onChangeText={setInputValue}
                onAdd={handleAddFromInput}
              />
            </View>

            {/* Selected ingredients */}
            {ingredients.length > 0 && (
              <View style={styles.selectedSection}>
                <View style={styles.selectedHeaderRow}>
                  <Text style={styles.subSectionTitle}>Your ingredients</Text>
                  <Pressable
                    onPress={clearAllIngredients}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Clear all ingredients"
                  >
                    <Text style={styles.clearAllText}>Clear all</Text>
                  </Pressable>
                </View>
                <View style={styles.chipWrap}>
                  {ingredients.map((name) => (
                    <IngredientChip
                      key={name}
                      name={name}
                      onRemove={() => removeIngredient(name)}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Suggested ingredients */}
          <View style={styles.card}>
            <Text style={styles.subSectionTitle}>Quick add</Text>
            <View style={styles.suggestedWrap}>
              {SUGGESTED_INGREDIENTS.map((name) => (
                <SuggestedIngredient
                  key={name}
                  name={name}
                  selected={isSelected(name)}
                  onPress={() => handleQuickAdd(name)}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Find Recipes button */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleFindRecipes}
            style={({ pressed }) => [
              styles.findButton,
              ingredients.length === 0 && styles.findButtonDisabled,
              pressed && ingredients.length > 0 && styles.findButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Find recipes"
          >
            <Text
              style={[
                styles.findButtonText,
                ingredients.length === 0 && styles.findButtonTextDisabled,
              ]}
            >
              Find Recipes 🍳
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.dark,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.dark,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputSpacing: {
    marginBottom: 4,
  },
  selectedSection: {
    marginTop: 20,
  },
  selectedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.danger,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  findButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
    minHeight: 54,
  },
  findButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },
  findButtonDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  findButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.dark,
  },
  findButtonTextDisabled: {
    color: COLORS.disabledText,
  },
});
