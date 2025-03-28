import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { body, check, validationResult } from "express-validator";

import { User, UserDocument, AuthToken } from "../models/User";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import { CallbackError, NativeError } from "mongoose";

import "../config/passport";

// ========== Validation Utilities ==========
const validateLogin = async (req: Request) => {
    await check("email", "Email is not valid").isEmail().run(req);
    await check("password", "Password cannot be blank").isLength({ min: 1 }).run(req);
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);
};

const validateSignup = async (req: Request) => {
    await check("email", "Email is not valid").isEmail().run(req);
    await check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req);
    await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);
};

const validateProfile = async (req: Request) => {
    await check("email", "Please enter a valid email address.").isEmail().run(req);
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);
};

const validatePassword = async (req: Request) => {
    await check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req);
    await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);
};

// ========== Route Handlers ==========

export const getLogin = (req: Request, res: Response): void => {
    if (req.user) return res.redirect("/");
    res.render("account/login", { title: "Login" });
};

export const postLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await validateLogin(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/login");
    }

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
    if (req.user) return res.redirect("/");
    res.render("account/signup", { title: "Create Account" });
};

export const postSignup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await validateSignup(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/signup");
    }

    const existingUser = await User.findOne({ email: req.body.email }).exec();
    if (existingUser) {
        req.flash("errors", { msg: "Account with that email address already exists." });
        return res.redirect("/signup");
    }

    const user = new User({ email: req.body.email, password: req.body.password });
    await user.save();
    req.logIn(user, (err) => {
        if (err) return next(err);
        res.redirect("/");
    });
};

export const getAccount = (req: Request, res: Response): void => {
    res.render("account/profile", { title: "Account Management" });
};

export const postUpdateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await validateProfile(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/account");
    }

    const user = await User.findById((req.user as UserDocument).id).exec();
    if (!user) return next(new Error("User not found"));

    user.email = req.body.email || "";
    user.profile.name = req.body.name || "";
    user.profile.gender = req.body.gender || "";
    user.profile.location = req.body.location || "";
    user.profile.website = req.body.website || "";

    try {
        await user.save();
        req.flash("success", { msg: "Profile information has been updated." });
    } catch (err: any) {
        if (err.code === 11000) {
            req.flash("errors", { msg: "The email address you have entered is already associated with an account." });
        } else {
            return next(err);
        }
    }

    res.redirect("/account");
};

export const postUpdatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await validatePassword(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/account");
    }

    const user = await User.findById((req.user as UserDocument).id).exec();
    if (!user) return next(new Error("User not found"));

    user.password = req.body.password;
    await user.save();
    req.flash("success", { msg: "Password has been changed." });
    res.redirect("/account");
};

export const postDeleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await User.deleteOne({ _id: (req.user as UserDocument).id });
    req.logout();
    req.flash("info", { msg: "Your account has been deleted." });
    res.redirect("/");
};

export const getOauthUnlink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const provider = req.params.provider;
    const user = await User.findById((req.user as UserDocument).id).exec();
    if (!user) return next(new Error("User not found"));

    user[provider] = undefined;
    user.tokens = user.tokens.filter((token: AuthToken) => token.kind !== provider);
    await user.save();

    req.flash("info", { msg: `${provider} account has been unlinked.` });
    res.redirect("/account");
};

export const getReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.isAuthenticated()) return res.redirect("/");

    const user = await User.findOne({
        passwordResetToken: req.params.token,
        passwordResetExpires: { $gt: Date.now() }
    }).exec();

    if (!user) {
        req.flash("errors", { msg: "Password reset token is invalid or has expired." });
        return res.redirect("/forgot");
    }

    res.render("account/reset", { title: "Password Reset" });
};

export const postReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await validatePassword(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("back");
    }

    async.waterfall([
        function resetPassword(done) {
            User.findOne({
                passwordResetToken: req.params.token,
                passwordResetExpires: { $gt: Date.now() }
            }, (err, user: any) => {
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
        function sendResetEmail(user: UserDocument, done) {
            const transporter = nodemailer.createTransport({
                service: "SendGrid",
                auth: {
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });

            const mailOptions = {
                to: user.email,
                from: "express-ts@starter.com",
                subject: "Your password has been changed",
                text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
            };

            transporter.sendMail(mailOptions, (err) => {
                req.flash("success", { msg: "Success! Your password has been changed." });
                done(err);
            });
        }
    ], (err) => {
        if (err) return next(err);
        res.redirect("/");
    });
};

export const getForgot = (req: Request, res: Response): void => {
    if (req.isAuthenticated()) return res.redirect("/");
    res.render("account/forgot", { title: "Forgot Password" });
};

export const postForgot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("email", "Please enter a valid email address.").isEmail().run(req);
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/forgot");
    }

    async.waterfall([
        function createToken(done) {
            crypto.randomBytes(16, (err, buf) => {
                done(err, buf.toString("hex"));
            });
        },
        function setToken(token, done) {
            User.findOne({ email: req.body.email }, (err, user: any) => {
                if (!user) {
                    req.flash("errors", { msg: "Account with that email address does not exist." });
                    return res.redirect("/forgot");
                }

                user.passwordResetToken = token;
                user.passwordResetExpires = Date.now() + 3600000;

                user.save((err: WriteError) => done(err, token, user));
            });
        },
        function sendEmail(token, user: UserDocument, done) {
            const transporter = nodemailer.createTransport({
                service: "SendGrid",
                auth: {
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });

            const mailOptions = {
                to: user.email,
                from: "hackathon@starter.com",
                subject: "Reset your password on Hackathon Starter",
                text: `You are receiving this email because a password reset was requested.\n\n` +
                      `Click the following link to reset your password:\n\n` +
                      `http://${req.headers.host}/reset/${token}\n\n` +
                      `If you didn't request this, ignore this email.\n`
            };

            transporter.sendMail(mailOptions, (err) => {
                req.flash("info", { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
                done(err);
            });
        }
    ], (err) => {
        if (err) return next(err);
        res.redirect("/forgot");
    });
};
