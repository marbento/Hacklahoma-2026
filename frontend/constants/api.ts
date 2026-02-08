/**
 * API Configuration
 * 
 * For different environments:
 * - iOS Simulator: http://localhost:8000
 * - Android Emulator: http://10.0.2.2:8000
 * - Physical Device: http://YOUR_COMPUTER_IP:8000 (e.g., http://192.168.1.100:8000)
 * 
 * To find your computer's IP:
 * - Windows: ipconfig
 * - Mac/Linux: ifconfig or ip addr
 */
export const API_BASE_URL = __DEV__
  ? 'http://localhost:8000' // Change this to match your setup
  : 'https://your-production-api.com';
