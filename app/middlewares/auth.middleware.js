import jwt from "jsonwebtoken";

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

// The auth middleware that checks the token
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

// The middleware that checks the roles
export const authorize = (...allowedRoles) => {
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

export default {
    generateToken,
    authenticate,
    authorize
};
