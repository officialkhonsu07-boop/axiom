// Natural language parsers for Gym and Nutrition

export interface ParsedGymActivity {
  estimatedCalories: number;
  muscleGroups: string;
}

export interface ParsedNutrition {
  estimatedCalories: number;
  protein: number;
  sugar: number;
}

export function parseGymDescription(text: string): ParsedGymActivity {
  const lower = text.toLowerCase();

  // Intensity multiplier
  let intensityMult = 1.0;
  if (/full power|max|intense|hard/.test(lower)) intensityMult = 1.3;
  else if (/light|easy|low/.test(lower)) intensityMult = 0.7;
  else if (/moderate|medium/.test(lower)) intensityMult = 1.0;

  // Extract duration in minutes
  let durationMin = 0;
  const durMatch = lower.match(/(\d+)\s*(?:min|minute)/);
  if (durMatch) durationMin = Number.parseInt(durMatch[1]);
  const hrMatch = lower.match(/(\d+)\s*(?:hr|hour)/);
  if (hrMatch) durationMin += Number.parseInt(hrMatch[1]) * 60;

  // Extract distance in km
  const distMatch = lower.match(/(\d+(?:\.\d+)?)\s*km/);
  const distKm = distMatch ? Number.parseFloat(distMatch[1]) : 0;

  // Extract sets/reps
  const setsMatch = lower.match(/(\d+)\s*set/);
  const totalSets = setsMatch ? Number.parseInt(setsMatch[1]) : 0;

  // Cardio
  let calories = 0;
  let muscleGroups = "Full Body";

  if (/run|jog|sprint/.test(lower)) {
    const km = distKm || durationMin * 0.15;
    calories = km * 70 * intensityMult;
    muscleGroups = "Legs, Cardio";
  } else if (/bike|cycl/.test(lower)) {
    const km = distKm || durationMin * 0.25;
    calories = km * 30 * intensityMult;
    muscleGroups = "Legs, Cardio";
  } else if (/swim/.test(lower)) {
    calories = (durationMin || 30) * 8 * intensityMult;
    muscleGroups = "Full Body, Cardio";
  } else if (/cardio|treadmill|elliptical/.test(lower)) {
    calories = (durationMin || 30) * 7 * intensityMult;
    muscleGroups = "Cardio";
  } else {
    // Strength training
    calories =
      totalSets > 0 ? totalSets * 15 * intensityMult : 200 * intensityMult;
    if (/chest|bench|push/.test(lower)) muscleGroups = "Chest, Triceps";
    else if (/back|row|pull|lat/.test(lower)) muscleGroups = "Back, Biceps";
    else if (/leg|squat|lunge|deadlift/.test(lower)) muscleGroups = "Legs";
    else if (/shoulder|press|delt/.test(lower)) muscleGroups = "Shoulders";
    else if (/arm|bicep|tricep|curl/.test(lower)) muscleGroups = "Arms";
    else if (/core|abs|plank/.test(lower)) muscleGroups = "Core";
    else muscleGroups = "Full Body";
  }

  if (calories === 0) calories = 200;

  return {
    estimatedCalories: Math.round(calories),
    muscleGroups,
  };
}

export function parseNutritionDescription(text: string): ParsedNutrition {
  const lower = text.toLowerCase();

  // Extract quantity patterns
  const gramMatch = lower.match(/(\d+)\s*g(?:ram)?/);
  const grams = gramMatch ? Number.parseInt(gramMatch[1]) : 100;
  const countMatch = lower.match(
    /(\d+)\s*(?:piece|egg|scoop|cup|slice|bowl|serving)/,
  );
  const count = countMatch ? Number.parseInt(countMatch[1]) : 1;

  let cal = 0;
  let protein = 0;
  let sugar = 0;

  // Food keyword matching (per 100g or per unit)
  if (/egg white/.test(lower)) {
    const n = count > 1 ? count : gramMatch ? grams / 30 : 1;
    cal = Math.round(n * 17);
    protein = Math.round(n * 3.6 * 10) / 10;
    sugar = 0;
  } else if (/egg/.test(lower)) {
    const n = count > 1 ? count : 1;
    cal = Math.round(n * 78);
    protein = Math.round(n * 6 * 10) / 10;
    sugar = 0;
  } else if (/chicken breast/.test(lower)) {
    const g = grams || 200;
    cal = Math.round(g * 1.65);
    protein = Math.round(g * 0.31 * 10) / 10;
    sugar = 0;
  } else if (/chicken/.test(lower)) {
    const g = grams || 200;
    cal = Math.round(g * 2.0);
    protein = Math.round(g * 0.25 * 10) / 10;
    sugar = 0;
  } else if (/rice/.test(lower)) {
    const g = grams || 150;
    cal = Math.round(g * 1.3);
    protein = Math.round(g * 0.027 * 10) / 10;
    sugar = Math.round(g * 0.001 * 10) / 10;
  } else if (/oat|oatmeal/.test(lower)) {
    const g = grams || 80;
    cal = Math.round(g * 3.89);
    protein = Math.round(g * 0.17 * 10) / 10;
    sugar = Math.round(g * 0.011 * 10) / 10;
  } else if (/banana/.test(lower)) {
    const n = count || 1;
    cal = Math.round(n * 89);
    protein = Math.round(n * 1.1 * 10) / 10;
    sugar = Math.round(n * 12 * 10) / 10;
  } else if (/protein shake|whey|protein powder/.test(lower)) {
    const scoops = count || 1;
    cal = Math.round(scoops * 120);
    protein = Math.round(scoops * 25 * 10) / 10;
    sugar = Math.round(scoops * 2 * 10) / 10;
  } else if (/bread/.test(lower)) {
    const slices = count || 2;
    cal = Math.round(slices * 80);
    protein = Math.round(slices * 3 * 10) / 10;
    sugar = Math.round(slices * 1.5 * 10) / 10;
  } else if (/milk/.test(lower)) {
    const ml = grams || 250;
    cal = Math.round(ml * 0.6);
    protein = Math.round(ml * 0.033 * 10) / 10;
    sugar = Math.round(ml * 0.047 * 10) / 10;
  } else if (/tuna/.test(lower)) {
    const g = grams || 150;
    cal = Math.round(g * 1.32);
    protein = Math.round(g * 0.29 * 10) / 10;
    sugar = 0;
  } else {
    // Default
    cal = 300;
    protein = 20;
    sugar = 5;
  }

  return {
    estimatedCalories: cal,
    protein,
    sugar,
  };
}
