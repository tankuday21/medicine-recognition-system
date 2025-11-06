const express = require('express');
const pharmacyService = require('../services/pharmacyService');

const router = express.Router();

// Search medicine prices
router.get('/prices/search', async (req, res) => {
  try {
    const { medicine, lat, lng } = req.query;

    if (!medicine || medicine.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid medicine name',
        message: 'Medicine name must be at least 2 characters long'
      });
    }

    let userLocation = null;
    if (lat && lng) {
      userLocation = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
      };
    }

    const result = await pharmacyService.searchMedicinePrices(medicine.trim(), userLocation);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json({
        error: 'Medicine not found',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Medicine price search error:', error);
    res.status(500).json({
      error: 'Price search failed',
      message: 'Internal server error'
    });
  }
});

// Find nearby pharmacies
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10, services } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Location required',
        message: 'Latitude and longitude are required'
      });
    }

    const userLocation = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    };

    const servicesList = services ? services.split(',').map(s => s.trim()) : [];
    const searchRadius = Math.min(parseFloat(radius), 50); // Max 50km radius

    const result = await pharmacyService.findNearbyPharmacies(
      userLocation,
      searchRadius,
      servicesList
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Pharmacy search failed',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Nearby pharmacies search error:', error);
    res.status(500).json({
      error: 'Pharmacy search failed',
      message: 'Internal server error'
    });
  }
});

// Get pharmacy details
router.get('/details/:pharmacyId', async (req, res) => {
  try {
    const { pharmacyId } = req.params;

    const result = await pharmacyService.getPharmacyDetails(pharmacyId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json({
        error: 'Pharmacy not found',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Get pharmacy details error:', error);
    res.status(500).json({
      error: 'Failed to get pharmacy details',
      message: 'Internal server error'
    });
  }
});

// Get available services
router.get('/services', async (req, res) => {
  try {
    const services = pharmacyService.getAvailableServices();
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      error: 'Failed to get services',
      message: 'Internal server error'
    });
  }
});

// Get service status
router.get('/status', async (req, res) => {
  try {
    const status = pharmacyService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get pharmacy service status error:', error);
    res.status(500).json({
      error: 'Failed to get service status',
      message: 'Internal server error'
    });
  }
});

module.exports = router;