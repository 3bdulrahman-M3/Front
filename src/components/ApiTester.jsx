import React, { useState } from 'react';
import { TestTube, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { 
  getConversationsList, 
  getConversationMessages,
  getUnreadCount 
} from '../api/api';

const ApiTester = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults = {};

    try {
      // Test 1: Get conversations list
      console.log('Testing conversations list...');
      try {
        const conversations = await getConversationsList();
        testResults.conversations = {
          success: true,
          data: conversations,
          count: Array.isArray(conversations) ? conversations.length : (conversations.results?.length || 0)
        };
      } catch (error) {
        testResults.conversations = {
          success: false,
          error: error.message
        };
      }

      // Test 2: Get unread count
      console.log('Testing unread count...');
      try {
        const unreadCount = await getUnreadCount();
        testResults.unreadCount = {
          success: true,
          data: unreadCount
        };
      } catch (error) {
        testResults.unreadCount = {
          success: false,
          error: error.message
        };
      }

      // Test 3: Get messages from first conversation
      if (testResults.conversations?.success && testResults.conversations.count > 0) {
        const firstConversation = testResults.conversations.data.results?.[0] || testResults.conversations.data[0];
        if (firstConversation) {
          console.log('Testing messages for conversation:', firstConversation.id);
          try {
            const messages = await getConversationMessages(firstConversation.id);
            testResults.messages = {
              success: true,
              data: messages,
              count: Array.isArray(messages) ? messages.length : (messages.results?.length || 0)
            };
          } catch (error) {
            testResults.messages = {
              success: false,
              error: error.message
            };
          }
        }
      }

    } catch (error) {
      console.error('Test error:', error);
      testResults.general = {
        success: false,
        error: error.message
      };
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <TestTube className="h-5 w-5 mr-2" />
          API Tester
        </h3>
        <button
          onClick={runTests}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <TestTube className="h-4 w-4" />
          )}
          <span>{loading ? 'Testing...' : 'Run Tests'}</span>
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="space-y-3">
          {Object.entries(results).map(([testName, result]) => (
            <div key={testName} className="border border-gray-200 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize">{testName.replace(/([A-Z])/g, ' $1').trim()}</h4>
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              
              {result.success ? (
                <div className="text-sm text-gray-600">
                  {result.count !== undefined && (
                    <div>Count: {result.count}</div>
                  )}
                  <div className="mt-1">
                    <details>
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        View Raw Data
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  Error: {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiTester;

