const express = require('express');
const router = express.Router();
const {
    addPatient,
    addDoctor,
    addPharmacist,
    getPatients,
    getDoctors,
    getPharmacists
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and only accessible by doctors
router.use(protect);
router.use(authorize('doctor'));

router.post('/patients', addPatient);
router.post('/doctors', addDoctor);
router.post('/pharmacists', addPharmacist);

router.get('/patients', getPatients);
router.get('/doctors', getDoctors);
router.get('/pharmacists', getPharmacists);

module.exports = router;
