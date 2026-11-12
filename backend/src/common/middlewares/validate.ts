import { Request, Response, NextFunction } from 'express';

export type BodyParser<T = unknown> = (body: unknown) => T;

export const validate = <T>(parser: BodyParser<T>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = parser(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};
