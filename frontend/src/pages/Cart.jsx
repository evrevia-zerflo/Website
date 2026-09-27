import React from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import ProgressiveImage from '../components/ProgressiveImage';

export default function Cart() {
  const { items, removeFromCart, getCartTotal } = useCartStore();

  return (
    <div className="cart-page">
      <h1>Your Shopping Cart</h1>
      
      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is currently empty.</p>
          <Link to="/shop">
            <button className="cta-button">Continue Shopping</button>
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.productId} className="cart-item">
                <div style={{ width: '100px', height: '100px' }}>
                  <ProgressiveImage src={item.image || 'https://via.placeholder.com/100'} alt={item.name} />
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>₹{item.price}</p>
                  <p>Qty: {item.quantity}</p>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.productId)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{getCartTotal()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>₹{getCartTotal()}</span>
            </div>
            <Link to="/checkout">
              <button className="cta-button checkout-btn">Proceed to Checkout</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
