import axios from 'axios';
import type { User } from '@/types/user';

const API_URL = 'https://juansoft.online/api/';

class AuthService {
  async login(email: string, password: string): Promise<User> {
    const response = await axios.post(API_URL + 'auth/login', {
      email,
      password
    });
    if (response.data.authorization?.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  async register(name: string, email: string, password: string, password_confirmation: string): Promise<User> {
    const response = await axios.post(API_URL + 'auth/register', {
      name,
      email,
      password,
      password_confirmation
    });
    if (response.data.authorization?.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  }
}

export default AuthService;
