import axios from 'axios';

/**
 * GYMETRA Fitness Service — Backend Proxy
 * 
 * Este servicio consume los ejercicios desde nuestro propio backend (Puerto 8090).
 * Esto elimina la dependencia directa de RapidAPI y permite servir GIFs locales.
 */

// Usamos la URL del microservicio QR donde centralizamos la lógica de ejercicios
const BASE_URL = import.meta.env.VITE_API_URL_QR || "http://localhost:8090/api";
const EXERCISES_API = `${BASE_URL}/exercises`;

import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
  baseURL: EXERCISES_API
});

// Interceptor para inyectar X-User-Id automáticamente en todas las peticiones
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
  gifUrl: string; // URL original (referencia)
  target: string;
  equipment: string;
  bodyPart: string;
}

/**
 * Obtiene ejercicios filtrados por la parte del cuerpo (body part).
 * Las imágenes se cargarán desde nuestro propio endpoint de GIFs del backend.
 */
export const getExercisesByBodyPart = async (bodyPart: string): Promise<Exercise[]> => {
  try {
    const response = await apiClient.get(`/bodyPart/${bodyPart.toLowerCase()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exercises for body part ${bodyPart}:`, error);
    throw error;
  }
};

/**
 * Helper para obtener la URL local del GIF servido por nuestro backend.
 * Devuelve la URL binaria servida por el microservicio QR.
 */
export const getLocalGifUrl = (exerciseId: string): string => {
  return `${EXERCISES_API}/${exerciseId}/gif`;
};

/**
 * Obtiene ejercicios filtrados por el músculo objetivo (target).
 */
export const getExercisesByMuscle = async (muscle: string): Promise<Exercise[]> => {
  try {
    const response = await apiClient.get(`/target/${muscle.toLowerCase()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exercises for muscle ${muscle}:`, error);
    throw error;
  }
};

/**
 * Obtiene la lista única de partes del cuerpo disponibles.
 */
export const getBodyPartList = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${EXERCISES_API}/bodyPartList`);
    return response.data;
  } catch (error) {
    console.error('Error fetching body part list:', error);
    return [];
  }
};

/**
 * Obtiene la lista única de músculos objetivo disponibles.
 */
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
