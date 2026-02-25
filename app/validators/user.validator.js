import { z } from "zod";

// In this file, you can put each schema for zod to use

// Schema to register
export const registerSchema = z.object({
    email: z
        .string()
        .email("Email invalide")
        .max(100, "Email trop long"),
    password: z
        .string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .max(100, "Mot de passe trop long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
        ),
    first_name: z
        .string()
        .min(1, "Prénom requis")
        .max(100, "Prénom trop long"),
    last_name: z
        .string()
        .min(1, "Nom requis")
        .max(100, "Nom trop long"),
    birth_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
        .optional(),
    gender_code: z
        .enum(["M", "F", "O"], { message: "Genre invalide (M/F/O)" })
        .optional(),
    role_code: z
        .enum(["ADMIN", "USER", "COACH"], { message: "Rôle invalide" })
        .default("USER")
});

// Schema to login
export const loginSchema = z.object({
    email: z
        .string()
        .email("Email invalide"),
    password: z
        .string()
        .min(1, "Mot de passe requis")
});

// Schema for updating profile
export const updateUserSchema = z.object({
    email: z
        .string()
        .email("Email invalide")
        .max(255, "Email trop long")
        .optional(),
    first_name: z
        .string()
        .min(1, "Prénom requis")
        .max(100, "Prénom trop long")
        .optional(),
    last_name: z
        .string()
        .min(1, "Nom requis")
        .max(100, "Nom trop long")
        .optional(),
    birth_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
        .optional(),
    gender_code: z
        .enum(["M", "F", "O"], { message: "Genre invalide (M/F/O)" })
        .optional()
});

// Schema for changing password
export const changePasswordSchema = z.object({
    current_password: z
        .string()
        .min(1, "Mot de passe actuel requis"),
    new_password: z
        .string()
        .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères")
        .max(100, "Mot de passe trop long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
        )
});

// Schema to update an user as an admin
export const adminUpdateUserSchema = z.object({
    email: z
        .string()
        .email("Email invalide")
        .max(255, "Email trop long")
        .optional(),
    first_name: z
        .string()
        .min(1, "Prénom requis")
        .max(100, "Prénom trop long")
        .optional(),
    last_name: z
        .string()
        .min(1, "Nom requis")
        .max(100, "Nom trop long")
        .optional(),
    birth_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
        .optional(),
    gender_code: z
        .enum(["M", "F", "O"], { message: "Genre invalide (M/F/O)" })
        .optional(),
    role_code: z
        .enum(["ADMIN", "USER", "COACH"], { message: "Rôle invalide" })
        .optional(),
    is_active: z
        .boolean()
        .optional()
});

// And this is the function (middleware) that require the datas to stick to zod validators
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

export const subscriptionPlanSchema = z.object({
    name: z
        .string()
        .min(1, "Nom requis")
        .max(100, "Nom trop long"),
    monthly_price: z
        .number(),
    duration_months: z
        .number()
        .int()
        .min(1, "Durée en mois requise")
        .max(120, "Durée en mois trop longue"),
    features_json: z
        .optional(),
    is_active: z
        .boolean()
});