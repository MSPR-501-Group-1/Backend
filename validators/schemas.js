import { z } from "zod";

// Re-usable: validate middleware is in `validators/user.validator.js` (exported as `validate`).

// Simple schemas for many resources. Adjust types as needed.

export const subscriptionPlanSchema = z.object({
    name: z.string().min(1).max(200),
    monthly_price: z.number(),
    duration_months: z.number().int().min(1),
    features_json: z.any().optional(),
    is_active: z.boolean().optional()
});

export const subscriptionSchema = z.object({
    user_id: z.string().uuid().optional(),
    subscription_plan_id: z.string().uuid().optional(),
    started_at: z.string().optional(),
    ends_at: z.string().optional(),
    status: z.string().optional()
});

export const invoiceSchema = z.object({
    user_id: z.string().uuid(),
    subscription_id: z.string().uuid().optional(),
    issued_at: z.string().optional(),
    total_amount: z.number(),
    status: z.string().optional(),
    pdf_url: z.string().url().optional()
});

export const paymentTransactionSchema = z.object({
    subscription_id: z.string().uuid().optional(),
    invoice_id: z.string().uuid().optional(),
    user_id: z.string().uuid().optional(),
    amount: z.number(),
    currency: z.string().optional(),
    payment_method: z.string().optional(),
    status: z.string().optional(),
    provider_response: z.any().optional()
});

export const foodSchema = z.object({
    name: z.string().min(1),
    calories: z.number().optional(),
    protein_g: z.number().optional(),
    fat_g: z.number().optional(),
    carbs_g: z.number().optional(),
    serving_size: z.string().optional()
});

export const recipeSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    servings: z.number().optional()
});

export const recipeIngredientSchema = z.object({
    recipe_id: z.string().uuid(),
    food_id: z.string().uuid(),
    quantity: z.number().optional(),
    unit: z.string().optional()
});

export const foodDiarySchema = z.object({
    user_id: z.string().uuid(),
    food_id: z.string().uuid().optional(),
    consumed_at: z.string().optional(),
    quantity: z.number().optional()
});

export const activityTypeSchema = z.object({
    code: z.string().min(1),
    description: z.string().optional()
});

export const exerciseSchema = z.object({
    activity_type_id: z.string().uuid().optional(),
    name: z.string().min(1),
    calories_burn_per_min: z.number().optional()
});

export const workoutSessionSchema = z.object({
    user_id: z.string().uuid(),
    started_at: z.string().optional(),
    duration_minutes: z.number().optional()
});

export const sessionDetailSchema = z.object({
    session_id: z.string().uuid(),
    exercise_id: z.string().uuid(),
    repetitions: z.number().optional(),
    sets: z.number().optional(),
    duration_seconds: z.number().optional()
});

export const connectedDeviceSchema = z.object({
    user_id: z.string().uuid(),
    device_type: z.string().optional(),
    serial_number: z.string().optional(),
    last_synced_at: z.string().optional()
});

export const biometricMeasureSchema = z.object({
    user_id: z.string().uuid(),
    measure_type: z.string().optional(),
    value: z.number().optional(),
    measured_at: z.string().optional()
});

export const aiRecommendationSchema = z.object({
    user_id: z.string().uuid(),
    type: z.string().optional(),
    payload: z.any().optional(),
    generated_at: z.string().optional()
});

export const progressTrackerSchema = z.object({
    user_id: z.string().uuid(),
    target_type: z.string().optional(),
    target_value: z.number().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional()
});

export const ingredientsSchema = z.object({
    name: z.string().min(1),
    brand: z.string().optional(),
    calories_100g: z.number().optional(),
    fat_100g: z.number().optional(),
    nutriscore: z.number().optional(),
    category_ref: z.string().optional(),
    fiber_g: z.number().optional(),
    sugar_g: z.number().optional(),
    sodium_mg: z.number().optional(),
    cholesterol_mg: z.number().optional(),
    protein_100g: z.number().optional(),
    carbs_100g: z.number().optional()
});

export const ingredientsAteSchema = z.object({
    consumed_at: z.string().optional(),
    quantity_grams: z.number().optional(),
    meal_type: z.string().optional(),
    calories_consumed: z.number().optional(),
    user_id: z.string().uuid()
});

export const userMetricsSchema = z.object({
    user_id: z.string().uuid(),
    metric_type: z.string().optional(),
    value: z.number().optional(),
    recorded_at: z.string().optional()
});

export const dietRecommendationSchema = z.object({
    user_id: z.string().uuid(),
    recommendation: z.string().optional(),
    created_at: z.string().optional()
});

export const dataSourceSchema = z.object({
    name: z.string().min(1),
    type: z.string().optional(),
    config_json: z.any().optional(),
    is_active: z.boolean().optional()
});

export const etlExecutionSchema = z.object({
    data_source_id: z.string().uuid(),
    started_at: z.string().optional(),
    finished_at: z.string().optional(),
    status: z.string().optional()
});

export const dataQualityCheckSchema = z.object({
    etl_execution_id: z.string().uuid(),
    check_name: z.string().optional(),
    result: z.string().optional(),
    details: z.any().optional()
});

export const dataAnomalySchema = z.object({
    data_source_id: z.string().uuid(),
    description: z.string().optional(),
    detected_at: z.string().optional()
});

export const healthGoalSchema = z.object({
    user_id: z.string().uuid(),
    goal_type: z.string().optional(),
    target_value: z.number().optional(),
    due_date: z.string().optional()
});

export const userProfileSchema = z.object({
    user_id: z.string().uuid(),
    height_cm: z.number().optional(),
    weight_kg: z.number().optional(),
    preferences_json: z.any().optional()
});

// Export a map for convenience
export default {
    subscriptionPlanSchema,
    subscriptionSchema,
    paymentTransactionSchema,
    ingredientsSchema,
    recipeSchema,
    recipeIngredientSchema,
    ingredientsAteSchema,
    activityTypeSchema,
    exerciseSchema,
    workoutSessionSchema,
    sessionDetailSchema,
    connectedDeviceSchema,
    biometricMeasureSchema,
    aiRecommendationSchema,
    userMetricsSchema,
    dietRecommendationSchema,
    dataSourceSchema,
    etlExecutionSchema,
    dataQualityCheckSchema,
    dataAnomalySchema,
    healthGoalSchema,
    userProfileSchema
};
