// routes/subjectRoutes.js
const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subject.controller");

router.post("/", subjectController.createSubject);
router.get("/instructor/:instructor_id", subjectController.getSubjectsByInstructor);
router.get("/join/:class_code", subjectController.getSubjectByCode);
router.delete("/:subject_id", subjectController.deleteSubject);

module.exports = router;
