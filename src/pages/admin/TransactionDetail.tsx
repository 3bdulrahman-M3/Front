import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  BookOpen,
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";
// @ts-ignore
import { getTransactionDetail } from "../../api/api.js";

interface TransactionDetail {
  id: number;
  transaction_id: string;
  student: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  course: {
    id: number;
    title: string;
    price: number;
    description: string;
    instructor: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  amount: number;
  currency: string;
  payment_status: "completed" | "pending" | "failed" | "cancelled" | "refunded";
  payment_method: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  created_at: string;
  completed_at?: string;
  notes?: string;
  metadata?: any;
  student_name: string;
  student_email: string;
  course_title: string;
  instructor_name: string;
  is_successful: boolean;
}

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTransactionDetail();
    }
  }, [id]);

  const loadTransactionDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransactionDetail(parseInt(id!));
      setTransaction(data);
    } catch (err) {
      setError("Failed to load transaction details. Please try again.");
      console.error("Error loading transaction detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: "text-green-600 bg-green-100",
          text: "Completed",
        };
      case "pending":
        return {
          icon: <Clock className="h-5 w-5" />,
          color: "text-yellow-600 bg-yellow-100",
          text: "Pending",
        };
      case "failed":
        return {
          icon: <XCircle className="h-5 w-5" />,
          color: "text-red-600 bg-red-100",
          text: "Failed",
        };
      case "cancelled":
        return {
          icon: <XCircle className="h-5 w-5" />,
          color: "text-gray-600 bg-gray-100",
          text: "Cancelled",
        };
      case "refunded":
        return {
          icon: <XCircle className="h-5 w-5" />,
          color: "text-orange-600 bg-orange-100",
          text: "Refunded",
        };
      default:
        return {
          icon: <Clock className="h-5 w-5" />,
          color: "text-gray-600 bg-gray-100",
          text: "Unknown",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Transaction</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/admin')}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Transaction Not Found</h2>
          <p className="text-sm text-gray-600 mb-4">The requested transaction could not be found.</p>
          <button 
            onClick={() => navigate('/admin')}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(transaction.payment_status);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header - Compact */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-3 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Admin
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
                Transaction Details
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                ID: {transaction.transaction_id}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
              >
                {statusInfo.icon}
                <span className="ml-1">{statusInfo.text}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Student Information - Compact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2 text-blue-600" />
              Student Information
            </h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-500">Name</label>
                <p className="text-sm text-gray-900">{transaction.student_name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900 flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  {transaction.student_email}
                </p>
              </div>
              {transaction.student.phone && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Phone</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {transaction.student.phone}
                  </p>
                </div>
              )}
              {transaction.student.address && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Address</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {transaction.student.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Course Information - Compact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-green-600" />
              Course Information
            </h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-500">Course Title</label>
                <p className="text-sm text-gray-900">{transaction.course_title}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Instructor</label>
                <p className="text-sm text-gray-900">{transaction.instructor_name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Price</label>
                <p className="text-sm text-gray-900 font-semibold">${transaction.amount}</p>
              </div>
              {transaction.course.description && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Description</label>
                  <p className="text-xs text-gray-900">{transaction.course.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information - Compact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-purple-600" />
              Payment Information
            </h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-500">Amount</label>
                <p className="text-sm text-gray-900 font-semibold">${transaction.amount} {transaction.currency}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Payment Method</label>
                <p className="text-sm text-gray-900 capitalize">{transaction.payment_method}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Status</label>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                >
                  {statusInfo.icon}
                  <span className="ml-1">{statusInfo.text}</span>
                </span>
              </div>
              {transaction.stripe_payment_intent_id && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Stripe Payment Intent</label>
                  <p className="text-xs text-gray-900 font-mono">{transaction.stripe_payment_intent_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Timeline - Compact */}
        <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
            Transaction Timeline
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-3 w-3 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Transaction Created</p>
                <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
              </div>
            </div>
            
            {transaction.completed_at && (
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Transaction Completed</p>
                  <p className="text-xs text-gray-500">{formatDate(transaction.completed_at)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information - Compact */}
        {(transaction.notes || transaction.metadata) && (
          <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Additional Information</h3>
            {transaction.notes && (
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-500">Notes</label>
                <p className="text-sm text-gray-900 mt-1">{transaction.notes}</p>
              </div>
            )}
            {transaction.metadata && (
              <div>
                <label className="text-xs font-medium text-gray-500">Metadata</label>
                <pre className="text-gray-900 mt-1 text-xs bg-gray-50 p-2 rounded-lg overflow-x-auto">
                  {JSON.stringify(transaction.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetail;
