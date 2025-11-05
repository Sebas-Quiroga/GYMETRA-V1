import axios from "axios";
import {  MAIN_API_URL } from "../services/apiService";
import { HOST_URL } from"../services/hots";
const baseUrl =  MAIN_API_URL ;

export async function sendRecoveryToken(email: string): Promise<string> {
  const res = await fetch(`${baseUrl}/forgot-password?email=${encodeURIComponent(email)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  const msg = await res.text();
  if (!res.ok) {
    console.error('❌ Error al enviar correo de recuperación:', {
      status: res.status,
      statusText: res.statusText,
      body: msg
    });
    throw new Error(msg);
  }
  return msg;
}

export async function validateRecoveryToken(token: string): Promise<string> {
  const res = await fetch(`${baseUrl}/validate-token?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  const msg = await res.text();
  if (!res.ok) {
    console.error('❌ Error al validar token de recuperación:', {
      status: res.status,
      statusText: res.statusText,
      body: msg
    });
    throw new Error(msg);
  }
  return msg;
}

export async function resetPassword(token: string, newPassword: string): Promise<string> {
  const res = await fetch(`${baseUrl}/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(newPassword)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  const msg = await res.text();
  if (!res.ok) {
    console.error('❌ Error al resetear contraseña:', {
      status: res.status,
      statusText: res.statusText,
      body: msg
    });
    throw new Error(msg);
  }
  return msg;
}