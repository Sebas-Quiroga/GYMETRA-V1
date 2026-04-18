import axios from 'axios';

/**
 * ExerciseDB API Service — RapidAPI
 * 
 * Este servicio gestiona la comunicación con la base de datos de ejercicios.
 * Requiere el host y la clave de API configurados en los headers.
 */

const EXERCISE_DB_HOST = 'exercisedb.p.rapidapi.com';
const BASE_URL = `https://${EXERCISE_DB_HOST}`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-rapidapi-host': EXERCISE_DB_HOST,
    'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY,
  },
});

export interface Exercise {
  id: string;
  name: string;
  gifUrl: string;
  target: string;
  equipment: string;
  bodyPart: string;
}

/**
 * Obtiene ejercicios filtrados por la parte del cuerpo (body part).
 * Ideal para términos generales como 'chest', 'back', etc.
 */
export const getExercisesByBodyPart = async (bodyPart: string): Promise<Exercise[]> => {
  try {
    const response = await apiClient.get(`/exercises/bodyPart/${bodyPart.toLowerCase()}`, {
      params: { limit: 20 }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching exercises for body part ${bodyPart}:`, error);
    throw error;
  }
};

/**
 * Obtiene ejercicios filtrados por el músculo objetivo (target).
 * Requiere nombres técnicos como 'abs', 'biceps', etc.
 */
export const getExercisesByMuscle = async (muscle: string): Promise<Exercise[]> => {
  try {
    const response = await apiClient.get(`/exercises/target/${muscle.toLowerCase()}`, {
      params: { limit: 20 }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching exercises for muscle ${muscle}:`, error);
    throw error;
  }
};

/**
 * Obtiene la lista completa de ejercicios disponibles.
 */
export const getAllExercises = async (): Promise<Exercise[]> => {
  try {
    const response = await apiClient.get('/exercises?limit=100');
    return response.data;
  } catch (error) {
    console.error('Error fetching all exercises:', error);
    throw error;
  }
};

export default {
  getExercisesByBodyPart,
  getExercisesByMuscle,
  getAllExercises,
};
