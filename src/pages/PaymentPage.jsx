import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { createPaymentIntent, enrollInCourse, getCourse } from "../api/api";
import { Loader2, ArrowLeft } from "lucide-react";

const stripePromise = loadStripe(
  "pk_test_51S11F3EHnp2eFdGWxa66vT42WjiPcvndK07DExtEdska4Vj3uz3wRZ8XJs7CLEDGiWEOUNCAtCkZXIJeg4wPKCNG00fB4jRUKQ"
);

const CheckoutForm = ({ course }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    try {
      // 🔥 Create PaymentIntent only when user submits
      const res = await createPaymentIntent(course.id, {
        amount: course.price * 100, // in cents
      });

      const cardElement = elements.getElement(CardElement);

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(res.client_secret, {
          payment_method: { card: cardElement },
        });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        await enrollInCourse(course.id, { intent_id: res.intent_id });
        navigate(`/course/${course.id}`);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-2xl rounded-2xl grid md:grid-cols-2 w-full max-w-5xl mx-auto overflow-hidden">
      {/* Left: Course Info */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white flex flex-col">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-64 object-cover"
        />
        <div className="p-8 flex flex-col justify-center flex-1">
          <h2 className="text-3xl font-bold mb-4">{course.title}</h2>
          <p className="text-lg mb-6">
            Enroll now and get instant lifetime access to this course.
          </p>
          <p className="text-4xl font-bold">${course.price}</p>
        </div>
      </div>

      {/* Right: Payment Form */}
      <form
        onSubmit={handlePayment}
        className="p-8 flex flex-col justify-center relative"
      >
        <button
          type="button"
          onClick={() => navigate(`/course/${course.id}`)}
          className="absolute top-6 left-6 text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h3 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          Secure Payment
        </h3>

        <div className="border rounded-lg p-4 mb-6 shadow-sm bg-gray-50">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#32325d",
                  "::placeholder": { color: "#a0aec0" },
                },
                invalid: { color: "#fa755a" },
              },
            }}
          />
        </div>

        {error && (
          <p className="text-red-500 mb-4 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            `Pay $${course.price} & Enroll`
          )}
        </button>
      </form>
    </div>
  );
};

const PaymentPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourse(id);
        setCourse(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourse();
  }, [id]);

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <Elements stripe={stripePromise}>
        <CheckoutForm course={course} />
      </Elements>
    </div>
  );
};

export default PaymentPage;
