import axios from 'axios';

const api = axios.create({
  baseURL: 'https://turbo-orbit-974w7pwq9j7r37p9g-8080.app.github.dev'
});

export default api;
