import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL_QR || "http://localhost:8090/api";
const EXERCISES_API = `${BASE_URL}/exercises`;
import { useAuthStore } from '../../auth/store/auth';
const apiClient = axios.create({
  baseURL: EXERCISES_API
});
apiClient.interceptors.request.use(async (config) => {
  const auth = useAuthStore();
  if (auth.user?.userId) {
    config.headers['X-User-Id'] = auth.user.userId.toString();
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
export interface Exercise {
  id: string;
  name: string;
  gifUrl: string;
  target: string;
  equipment: string;
  bodyPart: string;
}
export const getExercisesByBodyPart = async (bodyPart: string): Promise<Exercise[]> => {
  const response = await apiClient.get(`/bodyPart/${bodyPart.toLowerCase()}`);
  return response.data;
};
export const getLocalGifUrl = (exerciseId: string): string => {
  return `${EXERCISES_API}/${exerciseId}/gif`;
};
export const getExercisesByMuscle = async (muscle: string): Promise<Exercise[]> => {
  const response = await apiClient.get(`/target/${muscle.toLowerCase()}`);
  return response.data;
};
export const getBodyPartList = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${EXERCISES_API}/bodyPartList`);
    return response.data;
  } catch {
    return [];
  }
};
export const getTargetList = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${EXERCISES_API}/targetList`);
    return response.data;
  } catch {
    return [];
  }
};
export default {
  getExercisesByBodyPart,
  getExercisesByMuscle,
  getLocalGifUrl,
  getBodyPartList,
  getTargetList
};

