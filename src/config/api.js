const ENV = "development"; //"production"

const BASE_URLS = {
  development: "http://localhost:8080",
  production: "",
};

export const API_URL = `${BASE_URLS[ENV]}/api`;
