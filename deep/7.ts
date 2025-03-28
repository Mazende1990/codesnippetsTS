import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { User, UserDocument, AuthToken } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import { body, check, validationResult } from "express-validator";
import "../config/passport";
import { CallbackError, NativeError } from "mongoose";

// Helper functions
const isAuthenticatedRedirect = (req: Request, res: Response, redirectPath: string): boolean => {
  if (req.isAuthenticated()) {
    res.redirect(redirectPath);
    return true;
  }
  return false;
};

const renderWithTitle = (res: Response, view: string, title: string, data = {}) => {
  res.render(view, { title, ...data });
};

const handleValidationErrors = (req: Request, res: Response, redirectPath: string): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    res.redirect(redirectPath);
    return true;
  }
  return false;
};

const sendEmail = async (options: {
  to: string;
  subject: string;
  text: string;
  from?: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
      user: process.env.SENDGRID_USER,
      pass: process.env.SENDGRID_PASSWORD
    }
  });

  return transporter.sendMail({
    from: options.from || "express-ts@starter.com",
    ...options
  });
};

// Controller methods
export const getLogin = (req: Request, res: Response): void => {
  if (isAuthenticatedRedirect(req, res, "/")) return;
  renderWithTitle(res, "account/login", "Login");
};

export const postLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await Promise.all([
    check("email", "Email is not valid").isEmail().run(req),
    check("password", "Password cannot be blank").isLength({ min: 1 }).run(req),
    body("email").normalizeEmail({ gmail_remove_dots: false }).run(req)
  ]);

  if (handleValidationErrors(req, res, "/login")) return;

  passport.authenticate("local", (err: Error, user: UserDocument, info: IVerifyOptions) => {
    if (err) return next(err);
    if (!user) {
      req.flash("errors", { msg: info.message });
      return res.redirect("/login");
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      req.flash("success", { msg: "Success! You are logged in." });
      res.redirect(req.session.returnTo || "/");
    });
  })(req, res, next);
};

export const logout = (req: Request, res: Response): void => {
  req.logout();
  res.redirect("/");
};

export const getSignup = (req: Request, res: Response): void => {
  if (isAuthenticatedRedirect(req, res, "/")) return;
  renderWithTitle(res, "account/signup", "Create Account");
};

export const postSignup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await Promise.all([
    check("email", "Email is not valid").isEmail().run(req),
    check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req),
    check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req),
    body("email").normalizeEmail({ gmail_remove_dots: false }).run(req)
  ]);

  if (handleValidationErrors(req, res, "/signup")) return;

  const { email, password } = req.body;
  const user = new User({ email, password });

  User.findOne({ email }, (err: NativeError, existingUser: UserDocument) => {
    if (err) return next(err);
    if (existingUser) {
      req.flash("errors", { msg: "Account with that email address already exists." });
      return res.redirect("/signup");
    }

    user.save((err) => {
      if (err) return next(err);
      req.logIn(user, (err) => {
        if (err) return next(err);
        res.redirect("/");
      });
    });
  });
};

export const getAccount = (req: Request, res: Response): void => {
  renderWithTitle(res, "account/profile", "Account Management");
};

export const postUpdateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await Promise.all([
    check("email", "Please enter a valid email address.").isEmail().run(req),
    body("email").normalizeEmail({ gmail_remove_dots: false }).run(req)
  ]);

  if (handleValidationErrors(req, res, "/account")) return;

  const user = req.user as UserDocument;
  const { email, name, gender, location, website } = req.body;

  User.findById(user.id, (err: NativeError, user: UserDocument) => {
    if (err) return next(err);
    
    user.email = email || "";
    user.profile.name = name || "";
    user.profile.gender = gender || "";
    user.profile.location = location || "";
    user.profile.website = website || "";

    user.save((err: WriteError & CallbackError) => {
      if (err) {
        if (err.code === 11000) {
          req.flash("errors", { msg: "The email address is already associated with an account." });
          return res.redirect("/account");
        }
        return next(err);
      }
      req.flash("success", { msg: "Profile information has been updated." });
      res.redirect("/account");
    });
  });
};

export const postUpdatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await Promise.all([
    check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req),
    check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req)
  ]);

  if (handleValidationErrors(req, res, "/account")) return;

  const user = req.user as UserDocument;
  User.findById(user.id, (err: NativeError, user: UserDocument) => {
    if (err) return next(err);
    user.password = req.body.password;
    user.save((err: WriteError & CallbackError) => {
      if (err) return next(err);
      req.flash("success", { msg: "Password has been changed." });
      res.redirect("/account");
    });
  });
};

export const postDeleteAccount = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as UserDocument;
  User.deleteOne({ _id: user.id }, (err) => {
    if (err) return next(err);
    req.logout();
    req.flash("info", { msg: "Your account has been deleted." });
    res.redirect("/");
  });
};

export const getOauthUnlink = (req: Request, res: Response, next: NextFunction): void => {
  const provider = req.params.provider;
  const user = req.user as UserDocument;

  User.findById(user.id, (err: NativeError, user: any) => {
    if (err) return next(err);
    user[provider] = undefined;
    user.tokens = user.tokens.filter((token: AuthToken) => token.kind !== provider);
    
    user.save((err: WriteError) => {
      if (err) return next(err);
      req.flash("info", { msg: `${provider} account has been unlinked.` });
      res.redirect("/account");
    });
  });
};

export const getReset = (req: Request, res: Response, next: NextFunction): void => {
  if (isAuthenticatedRedirect(req, res, "/")) return;

  User.findOne({ 
    passwordResetToken: req.params.token,
    passwordResetExpires: { $gt: Date.now() }
  }).exec((err, user) => {
    if (err) return next(err);
    if (!user) {
      req.flash("errors", { msg: "Password reset token is invalid or has expired." });
      return res.redirect("/forgot");
    }
    renderWithTitle(res, "account/reset", "Password Reset");
  });
};

export const postReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await Promise.all([
    check("password", "Password must be at least 4 characters long.").isLength({ min: 4 }).run(req),
    check("confirm", "Passwords must match.").equals(req.body.password).run(req)
  ]);

  if (handleValidationErrors(req, res, "back")) return;

  async.waterfall([
    (done: (err: any, user: UserDocument) => void) => {
      User.findOne({
        passwordResetToken: req.params.token,
        passwordResetExpires: { $gt: Date.now() }
      }).exec((err, user: any) => {
        if (err) return next(err);
        if (!user) {
          req.flash("errors", { msg: "Password reset token is invalid or has expired." });
          return res.redirect("back");
        }

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        user.save((err: WriteError) => {
          if (err) return next(err);
          req.logIn(user, (err) => done(err, user));
        });
      });
    },
    (user: UserDocument, done: (err: Error) => void) => {
      sendEmail({
        to: user.email,
        subject: "Your password has been changed",
        text: `Hello,\n\nThis confirms the password for ${user.email} has been changed.\n`
      }).then(() => {
        req.flash("success", { msg: "Success! Your password has been changed." });
        done(null);
      }).catch(done);
    }
  ], (err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

export const getForgot = (req: Request, res: Response): void => {
  if (isAuthenticatedRedirect(req, res, "/")) return;
  renderWithTitle(res, "account/forgot", "Forgot Password");
};

export const postForgot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await Promise.all([
    check("email", "Please enter a valid email address.").isEmail().run(req),
    body("email").normalizeEmail({ gmail_remove_dots: false }).run(req)
  ]);

  if (handleValidationErrors(req, res, "/forgot")) return;

  async.waterfall([
    (done: (err: Error | null, token: string) => void) => {
      crypto.randomBytes(16, (err, buf) => {
        done(err, buf.toString("hex"));
      });
    },
    (token: string, done: (err: NativeError | WriteError | null, token?: string, user?: UserDocument) => void) => {
      User.findOne({ email: req.body.email }, (err: NativeError, user: any) => {
        if (err) return done(err);
        if (!user) {
          req.flash("errors", { msg: "Account with that email address does not exist." });
          res.redirect("/forgot");
          return done(null);
        }

        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save((err: WriteError) => done(err, token, user));
      });
    },
    (token: string, user: UserDocument, done: (err: Error | null) => void) => {
      sendEmail({
        to: user.email,
        from: "hackathon@starter.com",
        subject: "Reset your password on Hackathon Starter",
        text: `You are receiving this email because you (or someone else) have requested a password reset.\n\n
          Please click the following link to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email.\n`
      }).then(() => {
        req.flash("info", { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
        done(null);
      }).catch(done);
    }
  ], (err) => {
    if (err) return next(err);
    res.redirect("/forgot");
  });
};