const express = require('express');
const router = express.Router();
const {
    registerAdmin,
    getAllUsers,
    getUser,
    deactivateUser,
    activateUser,
    addDoctor,
    addPatient,
    addPharmacist
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Public route for first admin registration
router.post('/register', registerAdmin);

// Protected admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/deactivate', deactivateUser);
router.put('/users/:id/activate', activateUser);

// Add user routes (admin can add doctors, patients, pharmacists)
router.post('/doctors', addDoctor);
router.post('/patients', addPatient);
router.post('/pharmacists', addPharmacist);

module.exports = router;
