import { z } from "zod";

// Matches allergies_enum in the DB — adjust values to match your actual enum
const allergiesEnum = z.enum(
    ["GLUTEN", "LACTOSE", "NUTS", "EGGS", "SOY", "SHELLFISH", "FISH", "NONE"],
    { message: "Allergie invalide" }
);

// Matches diet_type_enum in the DB — adjust values to match your actual enum
const dietTypeEnum = z.enum(
    ["OMNIVORE", "VEGETARIAN", "VEGAN", "PESCATARIAN", "KETO", "PALEO"],
    { message: "Type de régime invalide" }
);

// ─── Create / replace full profile ───────────────────────────────────────────

// Used on POST — all fields optional since profile can be built progressively
export const createUserProfileSchema = z.object({
    height_cm: z
        .number({ invalid_type_error: "height_cm doit être un nombre" })
        .positive("La taille doit être positive")
        .max(999, "Taille invalide (max 999 cm)")   // DECIMAL(3,2) → max 9.99... wait, see note below
        .optional(),
    current_weight_kg: z
        .number({ invalid_type_error: "current_weight_kg doit être un nombre" })
        .positive("Le poids doit être positif")
        .max(999, "Poids invalide (max 999 kg)")    // DECIMAL(5,2) → max 999.99
        .optional(),
    activity_level_ref: z
        .string()
        .max(50, "Référence d'activité trop longue (max 50)")
        .optional(),
    allergies: allergiesEnum.optional(),
    diet_type: dietTypeEnum.optional(),
    goal_id: z
        .string()
        .max(50, "goal_id trop long (max 50)")
        .optional()
});

// ─── Partial update ───────────────────────────────────────────────────────────

// Used on PUT /users/:id/profile — same shape, same constraints
export const updateUserProfileSchema = createUserProfileSchema;

// ─── Validation middleware ────────────────────────────────────────────────────

export const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error.name === "ZodError" || error.errors) {
                return res.status(400).json({
                    success: false,
                    message: "Erreur de validation",
                    errors: error.errors?.map(e => ({
                        field: e.path.join("."),
                        message: e.message
                    })) || [{ field: "unknown", message: error.message }]
                });
            }
            next(error);
        }
    };
};

// ─── ⚠️  DB precision note ────────────────────────────────────────────────────
// height_cm is DECIMAL(3,2) in the DB which means max value is 9.99 cm — almost
// certainly a typo and should be DECIMAL(5,2) (max 999.99) like current_weight_kg.
// Validation above uses max(999) assuming that's the intent. Fix the column if needed:
//   ALTER TABLE user_profile ALTER COLUMN height_cm TYPE DECIMAL(5,2);