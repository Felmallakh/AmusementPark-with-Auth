const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { csrfProtection, asyncHandler } = require("./utils");
const { requireAuth } = require("../auth");

const db = require("../db/models");


const visitValidators = [
  check("visitedOn")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a value for Visited On")
    // .isDate({ format: "yyyy-MM-DD"})
    .matches(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(0[1-9]|1[1-9]|2[1-9])$/)
    .withMessage("Please provide a valid date"),
  check("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Please provide a number between 1 and 5 for Rating"),
];

router.get('/attraction/:attractionId(\\d+)/visit/add', requireAuth, csrfProtection,
  asyncHandler(async (req, res) => {
    // TODO Implement route handler.
    const attractionId = parseInt(req.params.attractionId, 10);
    const attraction = await db.Attraction.findById(attractionId);
    const visit = db.AttractionVisit.build();
    res.render('visit-add', { title: 'Add Visit', csrfToken: req.csrfToken(), attraction, visit})
  }));

router.post('/attraction/:attractionId(\\d+)/visit/add', requireAuth, csrfProtection, visitValidators,
  asyncHandler(async (req, res) => {
    // TODO Implement route handler.
    const { attractionId, visitedOn, rating, comments} = req.body;
    const visit = db.AttractionVisit.build({
        userId: res.locals.user.id,
        attractionId,
        visitedOn,
        rating,
        comments
    });

    const validatorErrors = validationResult(req);

    if (validatorErrors.isEmpty()) {
      await visit.save();
      res.redirect(`/attraction/${attractionId}`);
    } else {
      const errors = validatorErrors.array().map((error) => error.msg);
      res.render("visit-add", {
        title: "Add Visit",
        attraction,
        visit,
        errors,
        csrfToken: req.csrfToken(),
      });
    }
  }));

  module.exports = router;
