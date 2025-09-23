import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { HttpStatus } from '../constants/http.constant' 

interface RequestWithUser extends Request {
  user?: JwtPayload
}

export function requireAuth(req: RequestWithUser, res: Response, next: NextFunction) {
  const authorizationHeader = req.headers.authorization
  if (!authorizationHeader) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: 'Authorization header is missing' })
    return
  }

  const accessToken = authorizationHeader.split(' ')[1]
  if (!accessToken) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: 'Access token is missing in Authorization header' })
    return
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.SECRET_KEY_ACCESSTOKEN as string) as JwtPayload
    req.user = decoded
    next()
  } catch (error) {
    console.error('Error during token verification:', error)
    res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Unauthorized' })
    return
  }
}
