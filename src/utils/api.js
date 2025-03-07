const BASE_URL = "http://localhost:8000"; // Replace with your actual API base URL

const request = async (endpoint, method = "GET", body = null, headers = {}) => {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Something went wrong!");
    }

    return response.json();
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
};

export const api = {
  get: (endpoint, headers = {}) => request(endpoint, "GET", null, headers),
  post: (endpoint, body, headers = {}) => request(endpoint, "POST", body, headers),
  put: (endpoint, body, headers = {}) => request(endpoint, "PUT", body, headers),
  delete: (endpoint, headers = {}) => request(endpoint, "DELETE", null, headers),
};
