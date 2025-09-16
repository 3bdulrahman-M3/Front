import React, { useState, useEffect } from "react";
import {
  CreditCard,
  User,
  BookOpen,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
// @ts-ignore
import { getTransactions, getTransactionDetail } from "../../api/api.js";

interface Transaction {
  id: number;
  transaction_id: string;
  student_name: string;
  student_email?: string;
  student_email_address?: string;
  course_title: string;
  instructor_name: string;
  created_at: string;
  completed_at?: string;
  payment_status: "completed" | "pending" | "failed" | "cancelled" | "refunded";
  amount: number | string;
  currency: string;
  payment_method: string;
  is_successful?: boolean;
  // Optional nested objects for backward compatibility
  student?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  course?: {
    id: number;
    title: string;
    price: number;
    instructor: {
      first_name: string;
      last_name: string;
    };
  };
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Load transactions
  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from API first, fallback to mock data
      try {
        const params = {
          page: currentPage,
          search: searchTerm,
          status: statusFilter !== "all" ? statusFilter : undefined,
        };
        
        console.log("Loading transactions from API with params:", params);
        const data = await getTransactions(params);
        console.log("Transactions API response:", data);
        console.log("First transaction sample:", data.results?.[0]);
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setTransactions(data);
          setTotalPages(1);
          setTotalTransactions(data.length);
        } else if (data && data.results) {
          // Use API data directly without complex transformation
          console.log("Using API data directly:", data.results);
          setTransactions(data.results);
          setTotalPages(data.total_pages || 1);
          setTotalTransactions(data.count || 0);
        } else {
          console.log("Unexpected API response format, using mock data");
          throw new Error("Unexpected API response format");
        }
        return;
      } catch (apiError: any) {
        console.log("API not available, using mock data:", apiError);
        console.error("API Error details:", apiError);
        console.error("API Error stack:", apiError.stack);
      }
      
      // Fallback to mock data
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          transaction_id: "TXN_20240115103000_1",
          student: {
            id: 1,
            first_name: "أحمد",
            last_name: "محمد",
            email: "ahmed@example.com"
          },
          course: {
            id: 1,
            title: "تعلم React",
            price: 99.99,
            instructor: {
              first_name: "سارة",
              last_name: "أحمد"
            }
          },
          created_at: "2024-01-15T10:30:00Z",
          completed_at: "2024-01-15T10:30:00Z",
          payment_status: "completed",
          amount: 99.99,
          currency: "USD",
          payment_method: "stripe",
          student_name: "أحمد محمد",
          student_email: "ahmed@example.com",
          student_email_address: "ahmed@example.com",
          course_title: "تعلم React",
          instructor_name: "سارة أحمد",
          is_successful: true
        },
        {
          id: 2,
          transaction_id: "TXN_20240114142000_2",
          student: {
            id: 2,
            first_name: "فاطمة",
            last_name: "علي",
            email: "fatima@example.com"
          },
          course: {
            id: 2,
            title: "تعلم JavaScript",
            price: 149.99,
            instructor: {
              first_name: "محمد",
              last_name: "علي"
            }
          },
          created_at: "2024-01-14T14:20:00Z",
          payment_status: "pending",
          amount: 149.99,
          currency: "USD",
          payment_method: "stripe",
          student_name: "فاطمة علي",
          student_email: "fatima@example.com",
          student_email_address: "fatima@example.com",
          course_title: "تعلم JavaScript",
          instructor_name: "محمد علي",
          is_successful: false
        },
        {
          id: 3,
          transaction_id: "TXN_20240113091500_3",
          student: {
            id: 3,
            first_name: "خالد",
            last_name: "سعد",
            email: "khalid@example.com"
          },
          course: {
            id: 3,
            title: "تعلم Python",
            price: 199.99,
            instructor: {
              first_name: "نورا",
              last_name: "حسن"
            }
          },
          created_at: "2024-01-13T09:15:00Z",
          completed_at: "2024-01-13T09:15:00Z",
          payment_status: "completed",
          amount: 199.99,
          currency: "USD",
          payment_method: "stripe",
          student_name: "خالد سعد",
          student_email: "khalid@example.com",
          student_email_address: "khalid@example.com",
          course_title: "تعلم Python",
          instructor_name: "نورا حسن",
          is_successful: true
        },
        {
          id: 4,
          transaction_id: "TXN_20240112120000_4",
          student: {
            id: 1,
            first_name: "أحمد",
            last_name: "محمد",
            email: "ahmed@example.com"
          },
          course: {
            id: 2,
            title: "تعلم JavaScript",
            price: 149.99,
            instructor: {
              first_name: "محمد",
              last_name: "علي"
            }
          },
          created_at: "2024-01-12T12:00:00Z",
          payment_status: "failed",
          amount: 149.99,
          currency: "USD",
          payment_method: "stripe",
          student_name: "أحمد محمد",
          student_email: "ahmed@example.com",
          student_email_address: "ahmed@example.com",
          course_title: "تعلم JavaScript",
          instructor_name: "محمد علي",
          is_successful: false
        },
        {
          id: 5,
          transaction_id: "TXN_20240111180000_5",
          student: {
            id: 2,
            first_name: "فاطمة",
            last_name: "علي",
            email: "fatima@example.com"
          },
          course: {
            id: 1,
            title: "تعلم React",
            price: 99.99,
            instructor: {
              first_name: "سارة",
              last_name: "أحمد"
            }
          },
          created_at: "2024-01-11T18:00:00Z",
          completed_at: "2024-01-11T18:00:00Z",
          payment_status: "completed",
          amount: 99.99,
          currency: "USD",
          payment_method: "stripe",
          student_name: "فاطمة علي",
          student_email: "fatima@example.com",
          student_email_address: "fatima@example.com",
          course_title: "تعلم React",
          instructor_name: "سارة أحمد",
          is_successful: true
        }
      ];
      
      // Filter mock data based on search and status
      let filteredTransactions = mockTransactions;
      
      if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(transaction =>
          (transaction.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (transaction.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (transaction.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (transaction.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (transaction.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (transaction.student_email_address?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (transaction.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (transaction.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (transaction.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
        );
      }
      
      if (statusFilter !== "all") {
        filteredTransactions = filteredTransactions.filter(transaction =>
          transaction.payment_status === statusFilter
        );
      }
      
      setTransactions(filteredTransactions);
      setTotalPages(1);
      setTotalTransactions(filteredTransactions.length);
      
      console.log("Loaded mock transactions:", filteredTransactions);
    } catch (err: any) {
      setError("Failed to load transactions. Please try again.");
      console.error("Error loading transactions:", err);
      console.error("Error stack:", err.stack);
      console.error("Error message:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [currentPage, searchTerm, statusFilter]);

  // Calculate totals
  const totalRevenue = transactions.reduce((sum, transaction) => {
    try {
      if (!transaction) return sum;
      const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : (transaction.amount || 0);
      return sum + (transaction.payment_status === "completed" ? amount : 0);
    } catch (error) {
      console.error("Error calculating revenue for transaction:", transaction, error);
      return sum;
    }
  }, 0);

  const completedTransactions = transactions.filter(
    (t) => t && t.payment_status === "completed"
  ).length;

  const pendingTransactions = transactions.filter(
    (t) => t && t.payment_status === "pending"
  ).length;

  // Format date
  const formatDate = (dateString: string) => {
    try {
      if (!dateString || dateString === 'null' || dateString === 'undefined' || dateString === '') return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return 'Invalid Date';
    }
  };

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    try {
      if (!status || status === 'null' || status === 'undefined') {
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "text-gray-600 bg-gray-100",
          text: "Unknown",
        };
      }
      
      switch (status.toLowerCase()) {
        case "completed":
          return {
            icon: <CheckCircle className="h-4 w-4" />,
            color: "text-green-600 bg-green-100",
            text: "Completed",
          };
        case "pending":
          return {
            icon: <Clock className="h-4 w-4" />,
            color: "text-yellow-600 bg-yellow-100",
            text: "Pending",
          };
        case "failed":
          return {
            icon: <XCircle className="h-4 w-4" />,
            color: "text-red-600 bg-red-100",
            text: "Failed",
          };
        case "cancelled":
          return {
            icon: <XCircle className="h-4 w-4" />,
            color: "text-gray-600 bg-gray-100",
            text: "Cancelled",
          };
        case "refunded":
          return {
            icon: <XCircle className="h-4 w-4" />,
            color: "text-orange-600 bg-orange-100",
            text: "Refunded",
          };
        default:
          return {
            icon: <Clock className="h-4 w-4" />,
            color: "text-gray-600 bg-gray-100",
            text: "Unknown",
          };
      }
    } catch (error) {
      console.error("Error getting status info for status:", status, error);
      return {
        icon: <Clock className="h-4 w-4" />,
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
          <p className="text-sm text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Transactions</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadTransactions}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
        {/* Header - Compact */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
                Transactions
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage payment transactions
              </p>
            </div>
            <button className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Revenue</p>
                <p className="text-lg font-bold text-gray-900">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Completed</p>
                <p className="text-lg font-bold text-gray-900">
                  {completedTransactions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Pending</p>
                <p className="text-lg font-bold text-gray-900">
                  {pendingTransactions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-lg font-bold text-gray-900">
                  {totalTransactions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Compact */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table - Compact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student & Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <CreditCard className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm font-medium">No transactions found</p>
                      <p className="text-xs">No transactions match your current filters.</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => {
                    try {
                      const statusInfo = getStatusInfo(transaction.payment_status);
                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {transaction.student_name || (transaction.student?.first_name + ' ' + transaction.student?.last_name) || 'Unknown User'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {transaction.student?.email || transaction.student_email || transaction.student_email_address || 'No email available'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {transaction.course_title || transaction.course?.title || 'Unknown Course'}
                              </div>
                              <div className="text-xs text-gray-500">
                                by {transaction.instructor_name || (transaction.course?.instructor?.first_name + ' ' + transaction.course?.instructor?.last_name) || 'Unknown Instructor'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${(parseFloat(String(transaction.amount)) || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                          >
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.text}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(transaction.created_at || '')}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => window.location.href = `/admin/transactions/${transaction.id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                      );
                    } catch (rowError) {
                      console.error("Error rendering transaction row:", transaction, rowError);
                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td colSpan={6} className="px-4 py-3 text-center text-red-500 text-xs">
                            Error loading transaction data
                          </td>
                        </tr>
                      );
                    }
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination - Compact */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-700">
              Page {currentPage} of {totalPages} ({totalTransactions} total)
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        </div>
      </div>
    );
  } catch (renderError: any) {
    console.error("Error rendering Transactions component:", renderError);
    console.error("Render error stack:", renderError.stack);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Component Error</h2>
          <p className="text-sm text-gray-600 mb-4">Something went wrong while rendering the transactions page.</p>
          <p className="text-xs text-gray-500 mb-4">Error: {renderError.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default Transactions;
