const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};

const request = async (method, url, payload, config = {}) => {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`);
    error.response = {
      data,
      status: response.status,
    };
    throw error;
  }

  return {
    data,
    status: response.status,
  };
};

const axios = {
  get: (url, config) => request('GET', url, undefined, config),
  post: (url, payload, config) => request('POST', url, payload, config),
  put: (url, payload, config) => request('PUT', url, payload, config),
  delete: (url, config) => request('DELETE', url, undefined, config),
};

export default axios;
