import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { apiService } from '../services/api';
import { CreditCard, Lock } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy_key');


interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent
      const { clientSecret } = await apiService.createPaymentIntent(amount);

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent) {
        onSuccess(paymentIntent);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-md">
        <CardElement options={cardElementOptions} />
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Lock className="h-4 w-4" />
          <span>Secure payment powered by Stripe</span>
        </div>
        <span className="font-semibold">฿{amount.toLocaleString()}</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <CreditCard className="h-5 w-5" />
        <span>{processing ? 'Processing...' : `Pay ฿${amount.toLocaleString()}`}</span>
      </button>
    </form>
  );
};

interface StripePaymentProps {
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}

const StripePayment: React.FC<StripePaymentProps> = ({ amount, onSuccess, onError }) => {
  return (
    <Elements stripe={stripePromise}>
      <div className="bg-white p-6 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Card Payment</h3>
          <p className="text-sm text-gray-600">Enter your card details to complete the payment</p>
        </div>
        <PaymentForm amount={amount} onSuccess={onSuccess} onError={onError} />
      </div>
    </Elements>
  );
};

export default StripePayment;