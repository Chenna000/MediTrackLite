import React, { useState } from "react";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Modal from "react-modal";

// Set root element for accessibility
Modal.setAppElement("#root");

// Stripe public test key
const stripePromise = loadStripe("pk_test_51Re4bYDFkYWKdJXru5xFrO5irPqSWGleQkln0liOgBHU1h3Ga4QxLsHGuI44Swqr39oeTORY5CwsWhecfrLUjVT400nXEtPJEh");

const CheckoutForm = ({ onBookAppointment }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:8080/api/payment/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 10000 }) // ₹100
      });

      const { clientSecret } = await res.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: "Test Patient" },
        },
      });

      if (result.error) {
        setMessage("❌ Payment failed: " + result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        setPaymentSuccess(true);
        setShowModal(true);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = async () => {
    setShowModal(false);
    await onBookAppointment(); // Calls booking logic
    alert("✅ Appointment Booked Successfully!");
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{ width: 400, margin: "auto", padding: 20 }}>
        <CardElement />
        <button
          type="submit"
          disabled={!stripe || loading}
          style={{ marginTop: 20, padding: "10px 20px" }}
        >
          {loading ? "Processing..." : "Pay ₹100 to Book"}
        </button>
        {message && <p style={{ marginTop: 10, color: "red" }}>{message}</p>}
      </form>

      {/* ✅ Modal after success */}
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="Payment Success"
        style={{
          content: {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: 400,
          },
        }}
      >
        <h2>✅ Payment Successful!</h2>
        <p>Your payment has been processed successfully.</p>
        <button
          onClick={handleBookNow}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          📅 Book Appointment Now
        </button>
      </Modal>
    </>
  );
};

const AppointmentPayment = ({ onAppointmentBooked }) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm onBookAppointment={onAppointmentBooked} />
  </Elements>
);

export default AppointmentPayment;