import { z } from "zod";

// Schema to register
export const registerSchema = z.object({
    email: z
        .string()
        .email("Email invalide")
        .max(50, "Email trop long (max 50)"),       // VARCHAR(50) in DB
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
        .max(50, "Prénom trop long (max 50)"),       // VARCHAR(50) in DB
    last_name: z
        .string()
        .min(1, "Nom requis")
        .max(50, "Nom trop long (max 50)"),           // VARCHAR(50) in DB
    birth_date: z
    .string()
    .regex(
        /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?)?$/,
        "Format de date invalide (YYYY-MM-DD ou ISO 8601)"
    )
    .optional(),
    gender_code: z
    .number({ invalid_type_error: "gender_code doit être un entier" })
    .int("gender_code doit être un entier")
    .optional(),
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