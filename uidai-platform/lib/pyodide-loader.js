/**
 * Pyodide Loader - Singleton pattern for loading Python runtime
 * This ensures Pyodide is loaded only once and shared across the app
 */

let pyodideInstance = null;
let pyodideLoading = false;
let loadPromise = null;

export async function loadPyodide() {
  // If already loaded, return immediately
  if (pyodideInstance) {
    return pyodideInstance;
  }

  // If currently loading, wait for existing load
  if (pyodideLoading) {
    return loadPromise;
  }

  // Start loading
  pyodideLoading = true;
  
  loadPromise = (async () => {
    try {
      console.log('🐍 Loading Pyodide...');
      
      // Check we're in browser
      if (typeof window === 'undefined') {
        throw new Error('Pyodide can only run in browser');
      }

      // Load script dynamically if not already loaded
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Now loadPyodide should be available globally
      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
      });

      console.log('✅ Pyodide loaded successfully');
      console.log('📦 Installing packages: pandas, numpy...');
      
      // Load required packages
      await pyodide.loadPackage(['pandas', 'numpy', 'micropip']);
      
      console.log('✅ All packages installed - Pyodide ready!');
      
      pyodideInstance = pyodide;
      pyodideLoading = false;
      
      return pyodide;
    } catch (error) {
      console.error('❌ Failed to load Pyodide:', error);
      pyodideLoading = false;
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Execute Python code with error handling
 */
export async function runPython(code, context = {}) {
  const pyodide = await loadPyodide();
  
  try {
    // Set context variables
    for (const [key, value] of Object.entries(context)) {
      pyodide.globals.set(key, value);
    }
    
    // Run code
    const result = await pyodide.runPythonAsync(code);
    
    return result;
  } catch (error) {
    console.error('Python execution error:', error);
    throw new Error(`Python Error: ${error.message}`);
  }
}

/**
 * Load DataFrame from JSON
 */
export async function loadDataFrame(jsonData, dfName = 'df') {
  const pyodide = await loadPyodide();
  
  const code = `
import pandas as pd
import json

${dfName} = pd.DataFrame(json.loads('''${JSON.stringify(jsonData)}'''))
print(f"✓ Loaded {len(${dfName}):,} records into ${dfName}")
${dfName}.head()
  `;
  
  return await runPython(code);
}

/**
 * Check if Pyodide is ready
 */
export function isPyodideReady() {
  return pyodideInstance !== null;
}

/**
 * Get Pyodide version info
 */
export async function getPyodideInfo() {
  const pyodide = await loadPyodide();
  
  const code = `
import sys
import pandas as pd
import numpy as np

info = {
    'python_version': sys.version,
    'pandas_version': pd.__version__,
    'numpy_version': np.__version__,
}
info
  `;
  
  return await runPython(code);
}
