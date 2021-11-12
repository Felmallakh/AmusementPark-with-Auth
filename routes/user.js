const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const router = express.Router();

const db = require('../db/models');
const { csrfProtection, asyncHandler } = require('./utils');
const { loginUser, logoutUser } = require("../auth")


router.get('/user/register', csrfProtection, (req, res) => {
    const user = db.User.build();
    res.render('user-register', { user, title:"Register", csrfToken: req.csrfToken() });
});

const userValidators = [
    check('firstName')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a value for first name')
        .isLength({ max: 50 })
        .withMessage('First name must not be more than 50 characters'),
    check('lastName')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a value for last name')
        .isLength({ max: 50 })
        .withMessage('Last name must not be more than 50 characters'),
    check('emailAddress')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a value for email address')
        .isLength({ max: 255 })
        .withMessage('Email address must not be more than 255 characters')
        .isEmail()
        .withMessage('Email Address is not a valid email')
        .custom((value) => {
          return db.User.findOne({ where: { emailAddress: value } })
            .then((user) => {
              if (user) {
                return Promise.reject('The provided Email Address is already in use by another account');
              }
            });
        }),

    check('password')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a value for Password')
        .isLength({ max: 50 })
        .withMessage('Password must not be more than 50 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, 'g')
        .withMessage('Password must contain at least 1 lowercase letter, uppercase letter, number, and special character (i.e. "!@#$%^&*")'),
    check('confirmPassword')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a value for Confirm Password')
        .isLength({ max: 50 })
        .withMessage('Confirm Password must not be more than 50 characters long')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Confirm Password does not match Password');
            }
            return true;
    })
];

router.post('/user/register', csrfProtection, userValidators, asyncHandler( async (req, res) => {
    const { firstName, lastName, emailAddress, password } = req.body;
    const user = db.User.build({ firstName, lastName, emailAddress, password });

    const validatorErrors = validationResult(req);

    if(validatorErrors.isEmpty()) {
        console.log("succeeeeees")
        const hashedPassword = await bcrypt.hash(password, 10);
        user.hashedPassword = hashedPassword;
        await user.save();
        loginUser(req, res, user);
        res.redirect('/')
    } else {
        const errors = validatorErrors.array().map((error) => error.msg);
        console.log(errors)
        res.render("user-register", {
          title: "Register",
          csrfToken: req.csrfToken(),
          user,
          errors
        });
    }
}));

//ABCabc123123@

router.get("/user/login", csrfProtection, (req, res) => {
    res.render("user-login", {
        title: 'Login page',
        csrfToken: req.csrfToken()
    });
});

const loginValidators = [
  check("emailAddress")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a value for email address"),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a value for Password"),
];

router.post("/user/login", csrfProtection, loginValidators, asyncHandler(async (req, res) => {
  const { emailAddress, password } = req.body;

  let errors = [];
  const validatorErrors = validationResult(req, res, errors);

  if (validatorErrors.isEmpty()) {
        const user = await db.User.findOne({ where: { emailAddress } });

        //if (user)
        if (user !== null) {
            // If the user exists then compare their password
            // to the provided password.
            const matchedPassword = await bcrypt.compare(password, user.hashedPassword.toString());

            if (matchedPassword) {
                loginUser(req, res, user);
                return res.redirect("/");
            }
        }
        // Otherwise display an error message to the user.
      errors.push("Login failed for the provided email address and password");
    } else {
        errors = validatorErrors.array().map((error) => error.msg);
    }

  res.render('user-login', {
      title: 'Login page',
      csrfToken: req.csrfToken(),
      emailAddress,
      errors
  })
}));

router.post("/user/logout", (req, res) => {
    logoutUser(req, res);
     res.redirect('/');
})

module.exports = router;
