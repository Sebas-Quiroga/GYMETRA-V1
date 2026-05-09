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
  try {
    const response = await apiClient.get(`/bodyPart/${bodyPart.toLowerCase()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exercises for body part ${bodyPart}:`, error);
    throw error;
  }
};
export const getLocalGifUrl = (exerciseId: string): string => {
  return `${EXERCISES_API}/${exerciseId}/gif`;
};
export const getExercisesByMuscle = async (muscle: string): Promise<Exercise[]> => {
  try {
    const response = await apiClient.get(`/target/${muscle.toLowerCase()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exercises for muscle ${muscle}:`, error);
    throw error;
  }
};
export const getBodyPartList = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${EXERCISES_API}/bodyPartList`);
    return response.data;
  } catch (error) {
    console.error('Error fetching body part list:', error);
    return [];
  }
};
export const getTargetList = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${EXERCISES_API}/targetList`);
    return response.data;
  } catch (error) {
    console.error('Error fetching target list:', error);
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

