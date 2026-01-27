'use client';

import { useState } from 'react';

interface TestResult {
  url: string;
  method: string;
  status: 'pending' | 'success' | 'blocked' | 'error';
  statusCode?: number;
  errorMessage?: string;
  time?: number;
}

export default function AnalyticsTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Different test scenarios
  const testCases = [
    // Test different subdomains
    { url: 'https://analytics.pacabytes.io/api/event', method: 'POST', label: 'Original (analytics subdomain + /api/event)' },
    { url: 'https://pacabytes.io/api/event', method: 'POST', label: 'Root domain + /api/event' },
    { url: 'https://data.pacabytes.io/api/event', method: 'POST', label: 'Data subdomain + /api/event' },
    { url: 'https://stats.pacabytes.io/api/event', method: 'POST', label: 'Stats subdomain + /api/event' },
    
    // Test different paths with analytics subdomain
    { url: 'https://analytics.pacabytes.io/event', method: 'POST', label: 'Analytics subdomain + /event' },
    { url: 'https://analytics.pacabytes.io/e', method: 'POST', label: 'Analytics subdomain + /e' },
    { url: 'https://analytics.pacabytes.io/collect', method: 'POST', label: 'Analytics subdomain + /collect' },
    { url: 'https://analytics.pacabytes.io/data', method: 'POST', label: 'Analytics subdomain + /data' },
    { url: 'https://analytics.pacabytes.io/track', method: 'POST', label: 'Analytics subdomain + /track' },
    
    // Test with different methods
    { url: 'https://analytics.pacabytes.io/api/event', method: 'GET', label: 'Original with GET' },
    
    // Test neutral endpoints
    { url: 'https://analytics.pacabytes.io/api/health', method: 'GET', label: 'Analytics subdomain + /api/health' },
    { url: 'https://pacabytes.io/', method: 'GET', label: 'Root domain /' },
  ];

  const runTest = async (testCase: typeof testCases[0]): Promise<TestResult> => {
    const startTime = performance.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(testCase.url, {
        method: testCase.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: testCase.method === 'POST' ? JSON.stringify({
          n: 'pageview',
          u: 'https://clean.dev/analytics-test',
          d: 'clean.dev',
          r: null,
          w: window.innerWidth
        }) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const endTime = performance.now();

      return {
        url: testCase.url,
        method: testCase.method,
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        time: Math.round(endTime - startTime),
      };
    } catch (error) {
      const endTime = performance.now();
      
      // Check if it's a network error (likely blocked)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isNetworkError = errorMessage.includes('Failed to fetch') || 
                            errorMessage.includes('NetworkError') ||
                            errorMessage.includes('aborted');

      return {
        url: testCase.url,
        method: testCase.method,
        status: isNetworkError ? 'blocked' : 'error',
        errorMessage,
        time: Math.round(endTime - startTime),
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    for (const testCase of testCases) {
      const result = await runTest(testCase);
      setResults(prev => [...prev, result]);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'blocked': return 'text-red-600 bg-red-50';
      case 'error': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✓';
      case 'blocked': return '✗';
      case 'error': return '⚠';
      default: return '○';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Analytics Blocking Test</h1>
      <p className="text-gray-600 mb-6">
        Testing different URL patterns to identify what triggers uBlock Origin blocking.
        Install uBlock Origin and run these tests to see which requests get blocked.
      </p>

      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      {/* Test Cases List */}
      <div className="mb-8 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Test Cases ({testCases.length})</h2>
        <ul className="space-y-1 text-sm">
          {testCases.map((testCase, idx) => (
            <li key={idx} className="text-gray-700">
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">{testCase.method}</span>
              {' '}{testCase.label}
              {' '}<span className="text-gray-500">({testCase.url})</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Results</h2>
          
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {results.filter(r => r.status === 'success').length}
              </div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {results.filter(r => r.status === 'blocked').length}
              </div>
              <div className="text-sm text-gray-600">Blocked</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {results.filter(r => r.status === 'error').length}
              </div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {results.length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-2">
            {results.map((result, idx) => {
              const testCase = testCases[idx];
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    result.status === 'blocked' ? 'border-red-300' :
                    result.status === 'success' ? 'border-green-300' :
                    'border-orange-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(result.status)}`}>
                          {getStatusIcon(result.status)} {result.status.toUpperCase()}
                        </span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {result.method}
                        </span>
                        {result.time && (
                          <span className="text-xs text-gray-500">
                            {result.time}ms
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-sm mb-1">{testCase.label}</div>
                      <div className="font-mono text-xs text-gray-600 break-all">
                        {result.url}
                      </div>
                      {result.statusCode && (
                        <div className="text-xs text-gray-500 mt-1">
                          Status Code: {result.statusCode}
                        </div>
                      )}
                      {result.errorMessage && (
                        <div className="text-xs text-red-600 mt-1">
                          Error: {result.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold mb-2">How to use:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Make sure uBlock Origin (or your ad blocker) is installed and enabled</li>
          <li>Click "Run All Tests" to test different URL patterns</li>
          <li>Check the results to see which requests were blocked vs successful</li>
          <li>Analyze patterns: Is it the subdomain (analytics)? The path (/api/event)? Both?</li>
          <li>Use this info to find an alternative URL pattern that won't be blocked</li>
        </ol>
      </div>

      {/* Technical Notes */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p><strong>Note:</strong> Blocked requests typically show "Failed to fetch" errors. 
        This page tests various combinations of subdomains (analytics, data, stats, root) 
        and paths (/api/event, /event, /e, /collect, etc.) to identify blocking patterns.</p>
      </div>
    </div>
  );
}
