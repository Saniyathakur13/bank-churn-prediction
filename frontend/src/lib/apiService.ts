const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface PredictionResponse {
  predictions: Array<Record<string, unknown>>;
  csv_path: string;
}

export interface PredictionError {
  error: string;
}

export const apiService = {
  /**
   * Send customer data to Flask backend for churn prediction
   * @param csvData - Array of customer records parsed from CSV
   * @returns Promise with predictions and csv_path
   * @throws Error if backend is unreachable or prediction fails
   */
  async predictChurn(csvData: Array<Record<string, unknown>>): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(csvData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed');
      }

      return data;
    } catch (error) {
      // Handle network/connection errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          'Unable to connect to Flask backend. Please ensure the server is running on http://localhost:5000'
        );
      }
      throw error;
    }
  },

  /**
   * Download prediction results CSV from Flask backend
   * @returns Promise with Blob containing CSV file
   * @throws Error if download fails
   */
  async downloadResults(): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/download`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Download failed');
      }

      return response.blob();
    } catch (error) {
      // Handle network/connection errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to Flask backend.');
      }
      throw error;
    }
  },

  /**
   * Check if Flask backend is running and healthy
   * @returns Promise<boolean> - true if backend is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Get API base URL (useful for debugging)
   */
  getBaseUrl(): string {
    return API_BASE_URL;
  },
};

