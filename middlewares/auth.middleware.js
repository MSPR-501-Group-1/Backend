import jwt from "jsonwebtoken";
import { adminUpdateUserSchema, ownerUpdateUserSchema } from "../schemas/user.schema.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Generate a JWT token from user_id / email / role_code
export const generateToken = (user) => {
    return jwt.sign(
        {
            user_id: user.user_id,
            email: user.email,
            role_code: user.role_code
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

// Needs auth (token) to allow
export const requireAuth = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Non authentifié"
            });
        }

        if (!allowedRoles.includes(req.user.role_code)) {
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
    const isAdmin = req.user.role_code === "ADMIN";
    const isOwner = req.user.user_id === req.params.id;

    if (!isAdmin && !isOwner) {
        return res.status(403).json({
            success: false,
            message: "Accès non autorisé"
        });
    }
    next();
};

// Restricts a route to admins only.
// Must run after authenticate.
export const requireAdmin = (req, res, next) => {
    if (req.user.role_code !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Accès non autorisé"
        });
    }
    next();
};

export const selectUpdateSchema = (req, res, next) => {
    const schema = req.user.role_code === "ADMIN"
        ? adminUpdateUserSchema
        : ownerUpdateUserSchema;

    return validate(schema)(req, res, next);
};

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

export default {
    generateToken,
    authenticate,
    requireAuth,
    requireOwnerOrAdmin,
    requireAdmin,
    selectUpdateSchema,
    validate
};