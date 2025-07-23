import React, { useState } from 'react';
import { Product } from '../types';
import { 
  Star, 
  ShoppingCart, 
  Eye, 
  Heart, 
  Package, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Tag
} from 'lucide-react';

interface EnhancedProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  showActions?: boolean;
  compact?: boolean;
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  showActions = true,
  compact = false
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (product.stock <= 5) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    if (product.stock <= 10) return { text: 'Limited', color: 'text-orange-600 bg-orange-100' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  const stockStatus = getStockStatus();

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (compact) {
    return (
      <div className="card-responsive p-4 mobile-optimized">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg lazy-image"
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 rounded-lg animate-pulse" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-responsive">{product.name}</h3>
            <p className="text-lg font-bold text-blue-600 text-responsive">
              ฿{product.price.toLocaleString()}
            </p>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
              <span className="text-sm text-gray-500">Stock: {product.stock}</span>
            </div>
          </div>
          
          {showActions && (
            <button
              onClick={() => onAddToCart?.(product)}
              disabled={product.stock === 0}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card-responsive group mobile-optimized">
      {/* Image Section */}
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 lazy-image"
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <button
              onClick={() => onViewDetails?.(product)}
              className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors touch-target"
            >
              <Eye className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-3 rounded-full shadow-lg transition-colors touch-target ${
                isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
            {stockStatus.text}
          </span>
        </div>

        {/* Trending Badge */}
        {product.rating && product.rating > 4.5 && (
          <div className="absolute top-3 right-3">
            <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>Popular</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Category */}
        <div className="flex items-center space-x-1 mb-2">
          <Tag className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center">
              {renderStars(product.rating)}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({product.reviews || 0} reviews)
            </span>
          </div>
        )}

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              ฿{product.price.toLocaleString()}
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Package className="h-4 w-4" />
              <span>Stock: {product.stock}</span>
            </div>
          </div>
          
          {product.stock <= 5 && product.stock > 0 && (
            <div className="flex items-center space-x-1 text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Low Stock</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{product.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={() => onAddToCart?.(product)}
              disabled={product.stock === 0}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
            
            <button
              onClick={() => onViewDetails?.(product)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Added {new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
            <span>ID: {product.id.slice(-6)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;