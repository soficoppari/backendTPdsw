import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import pkg from 'jsonwebtoken';
const { TokenExpiredError } = pkg;

export type AuthRole = 'usuario' | 'veterinario';

export interface AuthUser {
  id: number;
  email: string;
  role: AuthRole;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

function isAuthUser(payload: string | JwtPayload): payload is AuthUser & JwtPayload {
  return (
    typeof payload !== 'string' &&
    (typeof payload.id === 'number' || typeof payload.id === 'string') &&
    typeof payload.email === 'string' &&
    (payload.role === 'usuario' || payload.role === 'veterinario')
  );
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Token no enviado.' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'JWT_SECRET no esta configurado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!isAuthUser(decoded)) {
      return res.status(401).json({ message: 'Token invalido.' });
    }

    req.authUser = {
      id: Number(decoded.id),
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: 'Token expirado.' });
    }

    return res.status(401).json({ message: 'Token invalido.' });
  }
}

export function authorizeRoles(...allowedRoles: AuthRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.authUser) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      return res.status(403).json({ message: 'No autorizado.' });
    }

    next();
  };
}
