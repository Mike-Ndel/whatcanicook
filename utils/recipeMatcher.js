// Recipe matching engine for WhatCanICook
// Phase 2A.3: Intelligent Recipe Matching with Ingredient Relationships
// Understands ingredient families, substitutions, and realistic combinations
// Provides detailed match explanations and handles ingredient alternatives

// === INGREDIENT CLASSIFICATION SYSTEM ===

/**
 * STAPLES: Generic ingredients that don't define a recipe alone
 * These NEVER create matches independently - they only support
 * matches that already have core ingredients
 */
const COMMON_STAPLES = new Set([
  'salt',
  'oil',
  'water',
  'pepper',
  'onion',
  'garlic',
]);

/**
 * CORE INGREDIENTS: Define what a recipe IS
 * These are essential to recipe identity and must be matched
 * with stronger weighting in scoring
 */
const CORE_INGREDIENTS = new Set([
  // Starches
  'rice',
  'plantain',
  'potato',
  'sweet potato',
  'cassava',
  'garri',
  'cornmeal',
  'cocoyam',
  'yam',
  
  // Proteins
  'chicken',
  'beef',
  'fish',
  'egg',
  'beans',
  'groundnut',
  'peanuts',
  'goat meat',
  'pork',
  
  // Leafy greens / soups
  'eru',
  'ndole',
  'okra',
  'waterleaf',
  'okok',
  'cabbage',
  'bitterleaf',
  
  // Grains
  'corn',
  'spaghetti',
  'bread',
  'flour',
  
  // Other defining ingredients
  'tomato',
  'crayfish',
  'palm oil',
  'achu',
  'koki',
  'mackerel',
]);

/**
 * Comprehensive ingredient aliases for normalization
 * Handles plurals, common variants, and Cameroonian ingredient variations
 * Carefully preserves distinctions (e.g., plantain ≠ banana)
 */
const INGREDIENT_ALIASES = {
  // Plurals
  tomatoes: 'tomato',
  eggs: 'egg',
  onions: 'onion',
  potatoes: 'potato',
  plantains: 'plantain',
  peppers: 'pepper',
  carrots: 'carrot',
  cabbages: 'cabbage',
  garlics: 'garlic',
  fishes: 'fish',
  beefs: 'beef',
  chickens: 'chicken',
  rices: 'rice',
  spaghettis: 'spaghetti',
  breads: 'bread',
  flours: 'flour',
  cocoyams: 'cocoyam',
  cassavas: 'cassava',
  erus: 'eru',
  okras: 'okra',
  waterleafs: 'waterleaf',
  okoks: 'okok',
  groundnuts: 'groundnut',
  peanuts: 'peanuts',
  crayfish: 'crayfish',
  yams: 'yam',
  mackerels: 'mackerel',
  
  // Common variants - meat/fish
  'beef meat': 'beef',
  'chicken meat': 'chicken',
  'chicken breast': 'chicken',
  'fresh fish': 'fish',
  'smoked fish': 'fish',
  'dried fish': 'fish',
  'goat meat': 'goat meat',
  'pork meat': 'pork',
  
  // Plantain variants (distinct from potato/banana)
  'ripe plantain': 'plantain',
  'unripe plantain': 'plantain',
  'green plantain': 'plantain',
  
  // Potato variants
  'irish potato': 'potato',
  'white potato': 'potato',
  'red potato': 'potato',
  
  // Oil variants
  'palm oil': 'palm oil',
  'vegetable oil': 'oil',
  'groundnut oil': 'oil',
  
  // Pepper variants
  'hot pepper': 'pepper',
  'fresh pepper': 'pepper',
  'sweet pepper': 'pepper',
  'scotch bonnet': 'pepper',
  
  // Tomato variants
  'fresh tomato': 'tomato',
  'tomato paste': 'tomato paste', // Keep separate - not equivalent
  
  // Leafy greens
  'bitter leaf': 'bitterleaf',
  'pumpkin leaves': 'pumpkin leaves',
  'country onion': 'country onion',

  // Onion variants
  'spring onion': 'green onion',
  'scallion': 'green onion',
  'scallions': 'green onion',
  
  // Grains
  'corn flour': 'cornmeal',
  'maize meal': 'cornmeal',
  
  // Cassava variants
  'cassava root': 'cassava',
  'cassava flour': 'cassava', // Approximate
  
  // Legumes
  'kidney beans': 'beans',
  'black beans': 'beans',
  'red beans': 'beans',
  'beans': 'beans',
};

/**
 * Ingredient families: Groups of ingredients that share culinary roles
 * NOTE: Family membership does NOT mean automatic substitution
 * Context and recipe type determine if substitution is valid
 */
const INGREDIENT_FAMILIES = {
  // Starches - filling base ingredients
  starches: ['rice', 'plantain', 'potato', 'sweet potato', 'cassava', 'garri', 'cocoyam', 'cornmeal', 'bread', 'yam', 'achu'],
  
  // Proteins - sources of protein
  proteins: ['chicken', 'beef', 'fish', 'egg', 'beans', 'groundnut', 'peanuts', 'pork', 'goat meat', 'crayfish'],
  
  // Leafy greens - cooking vegetables
  leafy_greens: ['eru', 'ndole', 'okra', 'waterleaf', 'okok', 'cabbage', 'bitterleaf', 'pumpkin leaves'],
  
  // Grains - grain-based staples
  grains: ['rice', 'spaghetti', 'corn', 'flour', 'cornmeal', 'bread'],
  
  // Meats - for substitution context
  meats: ['chicken', 'beef', 'fish', 'pork', 'goat meat'],
  
  // Fats - cooking oils
  fats: ['oil', 'palm oil', 'groundnut oil'],
  
  // Aromatics - flavor bases
  aromatics: ['onion', 'garlic', 'ginger', 'country onion'],
};

/**
 * Substitutions: Ingredients that can reasonably replace each other
 * Each has a confidence level (0-1) indicating substitution quality
 * 1.0 = excellent substitute, 0.8 = good substitute, 0.6 = acceptable but noticeable difference
 * 
 * IMPORTANT: Membership in same family ≠ automatic substitution
 * Only include substitutions that are genuinely reasonable
 */
const SUBSTITUTIONS = {
  // Proteins: More flexible substitution
  'chicken': [
    { ingredient: 'beef', confidence: 0.9 },
    { ingredient: 'fish', confidence: 0.8 },
    { ingredient: 'goat meat', confidence: 0.9 },
    { ingredient: 'pork', confidence: 0.8 },
  ],
  'beef': [
    { ingredient: 'chicken', confidence: 0.9 },
    { ingredient: 'goat meat', confidence: 0.95 },
    { ingredient: 'fish', confidence: 0.7 },
    { ingredient: 'pork', confidence: 0.85 },
  ],
  'fish': [
    { ingredient: 'chicken', confidence: 0.7 },
    { ingredient: 'beef', confidence: 0.6 },
    { ingredient: 'mackerel', confidence: 0.95 },
  ],
  'goat meat': [
    { ingredient: 'beef', confidence: 0.95 },
    { ingredient: 'chicken', confidence: 0.9 },
  ],
  'mackerel': [
    { ingredient: 'fish', confidence: 0.95 },
  ],
  
  // Starches: Limited, context-dependent
  'rice': [
    { ingredient: 'plantain', confidence: 0.6 }, // Different meal type
    { ingredient: 'cassava', confidence: 0.5 },  // Very different
  ],
  'plantain': [
    { ingredient: 'potato', confidence: 0.4 },   // Similar role but not equivalent
  ],
  'potato': [
    { ingredient: 'sweet potato', confidence: 0.8 },
    { ingredient: 'cassava', confidence: 0.6 },
  ],
  
  // Leafy greens: Not substitutable - each defines its own dish
  // eru -> ndole substitution is NOT valid (eru is spinach, ndolé is bitterleaf-based)
  
  // Oils: Some substitution possible
  'palm oil': [
    { ingredient: 'oil', confidence: 0.6 }, // Changes flavor significantly
  ],
  'oil': [
    { ingredient: 'palm oil', confidence: 0.5 }, // Changes recipe significantly
  ],
  
  // Note: beans, eggs, groundnuts, okra do NOT have good substitutes
  // Each defines specific recipes and shouldn't be substituted
};

/**
 * Determine if an ingredient is a reasonable substitute for another
 * @param {string} neededIngredient - The ingredient the recipe requires
 * @param {string} availableIngredient - The ingredient the user has
 * @returns {number} Confidence level (0-1), 0 if not a valid substitute
 */
function getSubstitutionConfidence(neededIngredient, availableIngredient) {
  if (neededIngredient === availableIngredient) {
    return 1.0; // Perfect match
  }

  const subs = SUBSTITUTIONS[neededIngredient];
  if (!subs) {
    return 0;
  }

  const match = subs.find(sub => sub.ingredient === availableIngredient);
  return match ? match.confidence : 0;
}

/**
 * Get the family(ies) an ingredient belongs to
 * @param {string} normalizedIngredient - Normalized ingredient name
 * @returns {string[]} Array of family names
 */
function getIngredientFamilies(normalizedIngredient) {
  const families = [];
  for (const [familyName, members] of Object.entries(INGREDIENT_FAMILIES)) {
    if (members.includes(normalizedIngredient)) {
      families.push(familyName);
    }
  }
  return families;
}

/**
 * Normalize an ingredient name for matching
 * Handles plurals, case-insensitivity, trimming, common aliases, and modifiers
 * Preserves meaningful modifiers like "ripe plantain" vs "unripe plantain"
 * @param {string} ingredient - The ingredient to normalize
 * @returns {string} The normalized ingredient name
 */
export function normalizeIngredient(ingredient) {
  if (!ingredient || typeof ingredient !== 'string') {
    return '';
  }

  // Trim whitespace and convert to lowercase
  let normalized = ingredient.trim().toLowerCase();

  // Check if exact match is in aliases (handles multi-word aliases like "irish potato")
  if (INGREDIENT_ALIASES[normalized]) {
    return INGREDIENT_ALIASES[normalized];
  }

  // Handle plural forms
  if (normalized.endsWith('s') && !normalized.endsWith('ss')) {
    const singular = normalized.slice(0, -1);
    
    // Check singular form in aliases
    if (INGREDIENT_ALIASES[singular]) {
      return INGREDIENT_ALIASES[singular];
    }
    
    // Handle -es -> -o pattern (tomatoes -> tomato)
    if (normalized.endsWith('es')) {
      const singularE = normalized.slice(0, -2) + 'o';
      if (INGREDIENT_ALIASES[singularE]) {
        return INGREDIENT_ALIASES[singularE];
      }
    }
  }

  // If no alias found, check if the normalized value itself is in aliases
  if (INGREDIENT_ALIASES[normalized]) {
    return INGREDIENT_ALIASES[normalized];
  }

  return normalized;
}

/**
 * Check if an ingredient is a core defining ingredient for recipes
 * @param {string} normalizedIngredient - Normalized ingredient name
 * @returns {boolean} True if ingredient is core/defining
 */
function isCoreIngredient(normalizedIngredient) {
  return CORE_INGREDIENTS.has(normalizedIngredient);
}

/**
 * Check if an ingredient is a common staple
 * @param {string} normalizedIngredient - Normalized ingredient name
 * @returns {boolean} True if ingredient is staple
 */
function isStaple(normalizedIngredient) {
  return COMMON_STAPLES.has(normalizedIngredient);
}

/**
 * Calculate if a recipe is relevant based on required ingredients
 * A recipe is relevant ONLY if:
 * - User has at least one core/defining ingredient from the recipe, OR
 * - User has at least 50% of required ingredients for multi-ingredient recipes
 * Staples alone NEVER create relevance
 * @param {string[]} userIngredients - Normalized user ingredients
 * @param {string[]} recipeRequiredIngredients - Normalized recipe required ingredients
 * @returns {boolean} True if recipe is relevant
 */
function isRecipeRelevant(userIngredients, recipeRequiredIngredients) {
  if (!recipeRequiredIngredients || recipeRequiredIngredients.length === 0) {
    return false;
  }

  // For single-ingredient recipes, just need that ingredient
  if (recipeRequiredIngredients.length === 1) {
    const required = recipeRequiredIngredients[0];
    return userIngredients.includes(required) && !isStaple(required);
  }

  // For multi-ingredient recipes, check multiple criteria
  let coreIngredientsMatched = 0;
  let coreIngredientsTotal = 0;
  let anyNonStapleMatched = false;

  for (const required of recipeRequiredIngredients) {
    const isCoreIng = isCoreIngredient(required);
    if (isCoreIng) {
      coreIngredientsTotal++;
      if (userIngredients.includes(required)) {
        coreIngredientsMatched++;
        anyNonStapleMatched = true;
      }
    } else if (userIngredients.includes(required) && !isStaple(required)) {
      anyNonStapleMatched = true;
    }
  }

  // Recipe is relevant if:
  // 1. At least one core ingredient matched, OR
  // 2. At least one non-staple required ingredient matched AND >= 50% of required ingredients matched
  if (anyNonStapleMatched) {
    if (coreIngredientsMatched > 0) {
      return true;
    }
    
    // Check if user has enough of the required ingredients
    let userHasRequired = 0;
    for (const required of recipeRequiredIngredients) {
      if (userIngredients.includes(required)) {
        userHasRequired++;
      }
    }
    
    // For relevance, require meaningful coverage of required ingredients
    return userHasRequired >= Math.ceil(recipeRequiredIngredients.length / 2);
  }

  return false;
}

/**
 * Calculate match score for a recipe
 * Improved scoring that weighs core ingredients more heavily
 * Gives bonus for having all required ingredients
 * @param {string[]} userIngredients - Normalized user ingredients
 * @param {string[]} recipeRequired - Normalized required ingredients
 * @param {string[]} recipeOptional - Normalized optional ingredients
 * @returns {number} Match percentage (0-100)
 */
function calculateMatchPercentage(userIngredients, recipeRequired, recipeOptional) {
  if (!recipeRequired || recipeRequired.length === 0) {
    return 0;
  }

  // Count matched required ingredients
  let matchedRequired = 0;
  let coreRequired = 0;
  let coreMatched = 0;

  for (const required of recipeRequired) {
    if (userIngredients.includes(required)) {
      matchedRequired++;
    }
    if (isCoreIngredient(required)) {
      coreRequired++;
      if (userIngredients.includes(required)) {
        coreMatched++;
      }
    }
  }

  // If user has no required ingredients at all, 0% match
  if (matchedRequired === 0) {
    return 0;
  }

  // Bonus for having all required ingredients (perfect match)
  const hasAllRequired = matchedRequired === recipeRequired.length;
  const perfectMatchBonus = hasAllRequired ? 15 : 0;

  // Required ingredients score (70% weight when core ingredients present)
  const baseRequiredPercentage = (matchedRequired / recipeRequired.length) * 100;
  
  // Weight by core ingredients if present
  let requiredScore;
  if (coreRequired > 0) {
    // Prioritize core ingredients: 80% of required score from core, 20% from supporting
    const corePercentage = (coreMatched / coreRequired) * 100;
    const supportingRequired = recipeRequired.length - coreRequired;
    let supportingPercentage = 0;
    if (supportingRequired > 0) {
      let supportingMatched = 0;
      for (const required of recipeRequired) {
        if (!isCoreIngredient(required) && userIngredients.includes(required)) {
          supportingMatched++;
        }
      }
      supportingPercentage = (supportingMatched / supportingRequired) * 100;
    } else {
      supportingPercentage = 100;
    }
    
    const weightedRequired = (corePercentage * 0.8) + (supportingPercentage * 0.2);
    requiredScore = weightedRequired * 0.7;
  } else {
    requiredScore = baseRequiredPercentage * 0.7;
  }

  // Optional ingredients score (30% weight)
  let optionalScore = 0;
  if (recipeOptional && recipeOptional.length > 0) {
    let matchedOptional = 0;
    for (const optional of recipeOptional) {
      // Count optional ingredient if user has it OR if it's a common staple
      if (userIngredients.includes(optional) || isStaple(optional)) {
        matchedOptional++;
      }
    }
    optionalScore = (matchedOptional / recipeOptional.length) * 30;
  } else {
    // If there are no optional ingredients, full optional score
    optionalScore = 30;
  }

  const totalScore = Math.round(requiredScore + optionalScore + perfectMatchBonus);
  return Math.min(100, Math.max(0, totalScore));
}

/**
 * Get detailed ingredient information for a recipe match
 * Separates matched and missing ingredients by type (required vs optional)
 * @param {string[]} userIngredients - Normalized user ingredients
 * @param {string[]} recipeRequired - Normalized required ingredients
 * @param {string[]} recipeOptional - Normalized optional ingredients
 * @returns {object} Detailed ingredient information
 */
function getMatchedAndMissingIngredients(userIngredients, recipeRequired, recipeOptional) {
  const matchedRequired = [];
  const missingRequired = [];
  const matchedOptional = [];
  const missingOptional = [];
  const matchedCore = [];
  const missingCore = [];

  // Check required ingredients
  for (const required of recipeRequired) {
    const isMatched = userIngredients.includes(required);

    if (isMatched) {
      matchedRequired.push(required);
    } else {
      missingRequired.push(required);
    }

    // Track core (defining) ingredients separately so callers/UI can
    // distinguish "this recipe's identity is present" from ordinary
    // required-ingredient coverage.
    if (isCoreIngredient(required)) {
      if (isMatched) {
        matchedCore.push(required);
      } else {
        missingCore.push(required);
      }
    }
  }

  // Check optional ingredients
  for (const optional of recipeOptional) {
    if (userIngredients.includes(optional)) {
      matchedOptional.push(optional);
    } else if (!isStaple(optional)) {
      // Only show missing if it's not a staple
      missingOptional.push(optional);
    }
  }

  return {
    matchedRequired,
    missingRequired,
    matchedOptional,
    missingOptional,
    matchedCore,
    missingCore,
    // For backward compatibility, combine into single arrays
    matched: [...matchedRequired, ...matchedOptional],
    missing: [...missingRequired, ...missingOptional],
  };
}

/**
 * Match recipes against user ingredients
 * Intelligent matching that prioritizes core ingredients and prevents false positives
 * @param {string[]} userIngredients - Array of ingredient names from user
 * @param {object[]} recipes - Array of recipe objects
 * @param {number} minThreshold - Minimum match percentage to include (default 50)
 * @returns {object[]} Array of match result objects, sorted by match quality
 */
export function matchRecipes(userIngredients, recipes, minThreshold = 50) {
  if (!userIngredients || userIngredients.length === 0) {
    return [];
  }

  if (!recipes || recipes.length === 0) {
    return [];
  }

  // Normalize user ingredients once
  const normalizedUserIngredients = userIngredients.map((ing) => normalizeIngredient(ing));

  const results = [];

  // Calculate match for each recipe
  for (const recipe of recipes) {
    // Normalize recipe ingredients
    const normalizedRequired = recipe.requiredIngredients
      ? recipe.requiredIngredients.map((ing) => normalizeIngredient(ing))
      : [];

    const normalizedOptional = recipe.optionalIngredients
      ? recipe.optionalIngredients.map((ing) => normalizeIngredient(ing))
      : [];

    // Check if recipe is relevant (has at least one meaningful ingredient match)
    if (!isRecipeRelevant(normalizedUserIngredients, normalizedRequired)) {
      continue;
    }

    // Calculate match percentage
    const matchPercentage = calculateMatchPercentage(
      normalizedUserIngredients,
      normalizedRequired,
      normalizedOptional
    );

    // Only include recipes that meet the minimum threshold
    if (matchPercentage >= minThreshold) {
      const ingredientInfo = getMatchedAndMissingIngredients(
        normalizedUserIngredients,
        normalizedRequired,
        normalizedOptional
      );

      // Determine if user has all required ingredients
      const hasAllRequiredIngredients = ingredientInfo.missingRequired.length === 0;

      results.push({
        recipe,
        matchPercentage,
        // Backward compatibility
        matchedIngredients: ingredientInfo.matched,
        missingIngredients: ingredientInfo.missing,
        // New detailed structure
        matchedRequiredIngredients: ingredientInfo.matchedRequired,
        missingRequiredIngredients: ingredientInfo.missingRequired,
        matchedOptionalIngredients: ingredientInfo.matchedOptional,
        missingOptionalIngredients: ingredientInfo.missingOptional,
        // Core (defining) ingredients - a subset of required ingredients
        // that determine recipe identity (e.g. rice/tomato for Tomato Rice)
        matchedCoreIngredients: ingredientInfo.matchedCore,
        missingCoreIngredients: ingredientInfo.missingCore,
        hasAllRequiredIngredients,
        matchedRequiredCount: ingredientInfo.matchedRequired.length,
        totalRequiredCount: normalizedRequired.length,
      });
    }
  }

  // Sort results intelligently:
  // 1. Recipes with all required ingredients first
  // 2. Then by highest match percentage
  // 3. Then by fewest missing required ingredients
  // 4. Then by fewest missing ingredients total
  results.sort((a, b) => {
    // All required ingredients first
    if (a.hasAllRequiredIngredients !== b.hasAllRequiredIngredients) {
      return a.hasAllRequiredIngredients ? -1 : 1;
    }
    
    // Then by match percentage
    if (a.matchPercentage !== b.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    
    // Then by fewest missing required
    if (a.missingRequiredIngredients.length !== b.missingRequiredIngredients.length) {
      return a.missingRequiredIngredients.length - b.missingRequiredIngredients.length;
    }
    
    // Finally by fewest missing overall
    return a.missingIngredients.length - b.missingIngredients.length;
  });

  return results;
}

/**
 * Format match results for display
 * Creates user-friendly output with recipe names, scores, and missing info
 * @param {object[]} results - Array of match result objects from matchRecipes()
 * @returns {string} Formatted string for display
 */
export function formatMatchResults(results) {
  if (!results || results.length === 0) {
    return 'No strong recipe matches found yet. Try adding another ingredient.';
  }

  let output = `Found ${results.length} recipe match${results.length !== 1 ? 'es' : ''}:\n\n`;

  results.forEach((result, index) => {
    const recipe = result.recipe;
    const matchText = result.hasAllRequiredIngredients ? '✓' : '';
    output += `${index + 1}. ${recipe.name} (${result.matchPercentage}%) ${matchText}\n`;
    
    // Show missing required ingredients if any
    if (result.missingRequiredIngredients && result.missingRequiredIngredients.length > 0) {
      output += `   Missing: ${result.missingRequiredIngredients.join(', ')}\n`;
    }
    
    output += '\n';
  });

  return output;
}
