import jwt from "jsonwebtoken";
import { adminUpdateUserSchema, ownerUpdateUserSchema } from "../schemas/user.schema.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const ROLE_GROUPS = Object.freeze({
    ANALYTICS: Object.freeze(["ADMIN", "PREMIUM", "PREMIUM_PLUS", "B2B"]),
    BUSINESS_ANALYTICS: Object.freeze(["ADMIN", "PREMIUM_PLUS", "B2B"]),
    DATA_QUALITY: Object.freeze(["ADMIN", "PREMIUM_PLUS"]),
    PARTNERS: Object.freeze(["ADMIN", "B2B"]),
});

// Generate a JWT token from user_id / email / role_type
export const generateToken = (user) => {
    return jwt.sign(
        {
            user_id: user.user_id,
            email: user.email,
            role_type: user.role_type
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// Verifies the Bearer token and attaches decoded payload to req.user
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token d'authentification requis"
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expiré"
            });
        }
        return res.status(401).json({
            success: false,
            message: "Token invalide"
        });
    }
};

// Verifies that req.user exists and has one of the allowed roles.
// Call with no args to just require authentication: requireRole()
// Must run after authenticate.
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Non authentifié"
            });
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role_type)) {
            return res.status(403).json({
                success: false,
                message: "Accès non autorisé pour ce rôle"
            });
        }

        next();
    };
};

// Allows the resource owner OR an admin to proceed.
// Must run after authenticate.
export const requireOwnerOrAdmin = (req, res, next) => {
    const isAdmin = req.user?.role_type === "ADMIN";
    const isOwner = req.user?.user_id === req.params.id;

    if (!isAdmin && !isOwner) {
        return res.status(403).json({
            success: false,
            message: "Accès non autorisé"
        });
    }
    next();
};

// Selects the appropriate update schema based on the user's role.
// Must run after authenticate.
export const selectUpdateSchema = (req, res, next) => {
    const schema = req.user?.role_type === "ADMIN"
        ? adminUpdateUserSchema
        : ownerUpdateUserSchema;

    return validate(schema)(req, res, next);
};

// Validates req.body against a Zod schema.
export const validate = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
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

export default {
    authenticate,
    requireRole,
    requireOwnerOrAdmin,
    selectUpdateSchema,
    validate,
    generateToken,
};