const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const middleware = require('../middleware/middleware')
const dashboardController  = require('../controllers/dashboardController')

// Define authentication routes
router.post('/login', authController.login);
router.get('/signup', authController.signup);
router.post('/sendOtp', authController.sendOtp);
router.post('/get_dashboard_data', middleware.authenticateToken, dashboardController.get_dashboard_data)
router.post('/add_chanting_data', middleware.authenticateToken, dashboardController.add_chanting_data)
router.post('/get_graph_data', middleware.authenticateToken, dashboardController.get_graph_data)

module.exports = router;
