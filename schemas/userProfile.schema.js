import { z } from "zod";

// Matches allergies_enum in root database/01_initdb.sql
const allergiesEnum = z.enum(
    ["NONE", "MILK", "GLUTEN", "SEAFOOD", "SOY", "EGGS", "NUTS", "OTHER"],
    { message: "Allergie invalide" }
);

// Matches diet_type_enum in root database/01_initdb.sql
const dietTypeEnum = z.enum(
    ["NONE", "VEGETARIAN", "VEGAN", "PESCATARIAN", "KETO", "PALEO", "OTHER"],
    { message: "Type de régime invalide" }
);

// ─── Create / replace full profile ───────────────────────────────────────────

// Used on POST — all fields optional since profile can be built progressively
export const createUserProfileSchema = z.object({
    height_cm: z
        .number({ invalid_type_error: "height_cm doit être un nombre" })
        .positive("La taille doit être positive")
        .max(999, "Taille invalide (max 999 cm)")
        .optional(),
    current_weight_kg: z
        .number({ invalid_type_error: "current_weight_kg doit être un nombre" })
        .positive("Le poids doit être positif")
        .max(999, "Poids invalide (max 999 kg)")
        .optional(),
    allergies: allergiesEnum.optional(),
    diet_type: dietTypeEnum.optional(),
    goal_id: z
        .string()
        .max(50, "goal_id trop long (max 50)")
        .nullable()
        .optional()
});

// ─── Partial update ───────────────────────────────────────────────────────────

// Used on PUT /user-profiles/:id — same shape, same constraints
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
