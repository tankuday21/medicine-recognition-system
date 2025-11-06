import React from 'react';
import PropTypes from 'prop-types';
import {
  CurrencyDollarIcon,
  MapPinIcon,
  StarIcon,
  PhoneIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const PriceComparison = ({ results, userLocation }) => {
  const { medicine, priceComparisons, summary } = results;

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }

    return stars;
  };

  const getSavingsColor = (price, lowestPrice) => {
    if (price === lowestPrice) return 'text-green-600';
    const difference = price - lowestPrice;
    if (difference <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBestValueBadge = (comparison, index) => {
    if (index === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          <TagIcon className="h-3 w-3 mr-1" />
          Best Price
        </span>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Medicine Info Header */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {medicine.genericName}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Brand Name:</span>
            <p>{medicine.brandName}</p>
          </div>
          <div>
            <span className="font-medium">Strength:</span>
            <p>{medicine.strength}</p>
          </div>
          <div>
            <span className="font-medium">Quantity:</span>
            <p>{medicine.quantity} tablets</p>
          </div>
          <div>
            <span className="font-medium">In Stock:</span>
            <p>{summary.pharmaciesInStock}/{summary.totalPharmacies} pharmacies</p>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center mb-2">
            <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
            <span className="ml-2 font-medium text-green-900">Lowest Price</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatPrice(summary.lowestPrice)}</p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center mb-2">
            <CurrencyDollarIcon className="h-5 w-5 text-red-600" />
            <span className="ml-2 font-medium text-red-900">Highest Price</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatPrice(summary.highestPrice)}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center mb-2">
            <TagIcon className="h-5 w-5 text-blue-600" />
            <span className="ml-2 font-medium text-blue-900">Max Savings</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatPrice(summary.maxSavings)}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center mb-2">
            <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
            <span className="ml-2 font-medium text-purple-900">Average Price</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{formatPrice(summary.averagePrice)}</p>
        </div>
      </div>

      {/* Price Comparison List */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Price Comparison by Pharmacy</h4>
        
        {priceComparisons.map((comparison, index) => (
          <div
            key={comparison.pharmacy.id}
            className={`p-4 border rounded-lg transition-colors ${
              index === 0 ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Pharmacy Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h5 className="font-semibold text-gray-900">{comparison.pharmacy.name}</h5>
                      {getBestValueBadge(comparison, index)}
                    </div>
                    <p className="text-sm text-gray-600">{comparison.pharmacy.chain}</p>
                  </div>
                </div>

                {/* Pharmacy Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-start space-x-2 mb-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700">{comparison.pharmacy.address}</p>
                        {comparison.distance && (
                          <p className="text-gray-500">{comparison.distance} km away</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <a
                        href={`tel:${comparison.pharmacy.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {comparison.pharmacy.phone}
                      </a>
                    </div>

                    {comparison.pharmacy.website && (
                      <div className="flex items-center space-x-2">
                        <GlobeAltIcon className="h-4 w-4 text-gray-400" />
                        <a
                          href={comparison.pharmacy.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {getRatingStars(comparison.pharmacy.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {comparison.pharmacy.rating} ({comparison.pharmacy.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center space-x-2 mb-2">
                      {comparison.price.inStock ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${comparison.price.inStock ? 'text-green-700' : 'text-red-700'}`}>
                        {comparison.price.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Online Ordering */}
                    {comparison.pharmacy.hasOnlineOrdering && (
                      <div className="flex items-center space-x-2">
                        <GlobeAltIcon className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-blue-700">Online Ordering Available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="ml-6 text-right">
                <div className="mb-2">
                  {comparison.price.discount > 0 && (
                    <p className="text-sm text-gray-500 line-through">
                      {formatPrice(comparison.price.price)}
                    </p>
                  )}
                  <p className={`text-2xl font-bold ${getSavingsColor(comparison.price.finalPrice, summary.lowestPrice)}`}>
                    {formatPrice(comparison.price.finalPrice)}
                  </p>
                </div>

                {comparison.price.discount > 0 && (
                  <div className="mb-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Save {formatPrice(comparison.price.discount)}
                    </span>
                  </div>
                )}

                {comparison.price.finalPrice > summary.lowestPrice && (
                  <p className="text-sm text-red-600">
                    +{formatPrice(comparison.price.finalPrice - summary.lowestPrice)} vs lowest
                  </p>
                )}

                {comparison.pharmacy.hasOnlineOrdering && comparison.price.inStock && (
                  <button
                    onClick={() => window.open(comparison.pharmacy.website, '_blank')}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Order Online
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Prices are estimates and may vary. Always verify with the pharmacy.</li>
          <li>Insurance coverage may significantly affect your final cost.</li>
          <li>Call ahead to confirm availability before visiting.</li>
          <li>Some pharmacies may offer additional discounts or price matching.</li>
        </ul>
      </div>
    </div>
  );
};

PriceComparison.propTypes = {
  results: PropTypes.object.isRequired,
  userLocation: PropTypes.object
};

export default PriceComparison;