import { body } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";

export const confessionValidation = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Content must be between 1 and 1000 characters"),

  body("collegeName").trim().notEmpty().withMessage("College name is required"),

  body("isAnonymous")
    .optional()
    .isBoolean()
    .withMessage("isAnonymous must be a boolean value"),
];

export const userValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),

  body("email").trim().isEmail().withMessage("Must be a valid email address"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("collegeName").trim().notEmpty().withMessage("College name is required"),
];

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({ errors: errors.array() });
  };
};

export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === "string") {
        req.query[key] = (req.query[key] as string).trim();
      }
    });
  }

  next();
};
