import { config } from '../../environment';
import axios from 'axios';
import HttpRoutingService from './httpRoutingService';

interface dataType {
  data: any;
  token?: string;
}
const authServiceApi = async (data: any, url: string, token: string = '') => {
  console.log('Post Api call for', url, data);

  return await new Promise(async (resolve, reject) => {
    await axios
      .post(config.apiUrldb + url, data, {
        headers: {
          'Content-type': 'application/json',
          'Access-control-allow-origin': '*',
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        resolve(res?.data);
      })
      .catch((error: any) => {
        reject(error);
      });
  });
};

class authService {
  async signin({ data }: dataType) {
    return authServiceApi(data, 'api/auth/signin');
  }
  async signup({ data }: dataType) {
    return authServiceApi(data, 'api/auth/signup');
  }
  async verifyOtp({ data }: dataType) {
    return authServiceApi(data, 'api/auth/verify-otp');
  }
  async resendOtp({ data }: dataType) {
    return authServiceApi(data, 'api/auth/resend-otp');
  }
  async signinWithGoogle({ data, token }: dataType) {
    return authServiceApi(data, 'api/auth/signin/google', token);
  }
  async userDetails() {
    return HttpRoutingService.getMethod('api/auth/user-details', {});
  }
  async resetPassword({ data }: dataType) {
    return authServiceApi(data, 'api/auth/reset-password');
  }
  async forgotPassword({ data }: dataType) {
    return authServiceApi(data, 'api/auth/forgot-password');
  }
}
const AuthService = new authService();
export default AuthService;
