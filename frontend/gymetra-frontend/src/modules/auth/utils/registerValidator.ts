export const validationRules = {
  identification: (value: string): string => {
    const id = value.trim();
    if (!id) return "La identificación es obligatoria";
    if (!/^\d+$/.test(id)) return "Solo se permiten números";
    if (id.length < 6 || id.length > 12) return "Debe tener entre 6 y 12 dígitos";
    return "";
  },
  firstName: (value: string): string => {
    const name = value.trim();
    if (!name) return "El nombre es obligatorio";
    if (name.length < 2) return "Mínimo 2 caracteres";
    if (name.length > 50) return "Máximo 50 caracteres";
    if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(name)) return "Solo se permiten letras y espacios";
    return "";
  },
  lastName: (value: string): string => {
    const name = value.trim();
    if (!name) return "El apellido es obligatorio";
    if (name.length < 2) return "Mínimo 2 caracteres";
    if (name.length > 50) return "Máximo 50 caracteres";
    if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(name)) return "Solo se permiten letras y espacios";
    return "";
  },
  email: (value: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValue = value.trim().toLowerCase();
    if (!emailValue) return "El correo electrónico es obligatorio";
    if (emailValue.length > 100) return "El correo es demasiado largo";
    if (!emailRegex.test(emailValue)) return "Ingresa un correo válido";
    return "";
  },
  password: (value: string): string => {
    if (!value) return "La contraseña es obligatoria";
    if (value.length < 8) return "Mínimo 8 caracteres";
    if (value.length > 100) return "Máximo 100 caracteres";
    return "";
  },
  confirmPassword: (value: string, passwordValue: string): string => {
    if (!value) return "Confirma tu contraseña";
    if (passwordValue !== value) return "Las contraseñas no coinciden";
    return "";
  },
  phone: (value: string): string => {
    if (!value || value.trim().length === 0) return "";
    const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
    if (!/^\+?[\d]+$/.test(cleanPhone)) return "Formato de teléfono inválido";
    if (cleanPhone.length < 7 || cleanPhone.length > 15) return "El teléfono debe tener entre 7 y 15 dígitos";
    return "";
  },
  acceptData: (value: boolean): string => {
    return value ? "" : "Debes aceptar los términos y condiciones";
  },
};
