# 📊 Script de Datos de Prueba - GYMETRA

## 📋 Descripción

Este script (`test_data.sql`) inserta datos de prueba realistas para el desarrollo y testing del sistema GYMETRA, incluyendo:

- ✅ **1 Usuario Administrador**
- ✅ **20 Usuarios Clientes**
- ✅ **20 Pagos** con diferentes estados
- ✅ **Membresías activas**
- ✅ **Códigos QR generados**
- ✅ **Logs de acceso**

## 🚀 Cómo Ejecutar

### Opción 1: Ejecutar después del script inicial
```bash
# 1. Ejecutar el script inicial
psql -U tu_usuario -d gymetra_db -f database_\ Initial.sql

# 2. Ejecutar los datos de prueba
psql -U tu_usuario -d gymetra_db -f test_data.sql
```

### Opción 2: Ejecutar todo junto
```bash
# Combinar ambos scripts
cat database_\ Initial.sql test_data.sql > setup_complete.sql
psql -U tu_usuario -d gymetra_db -f setup_complete.sql
```

## 👤 Credenciales de Acceso

### 🔐 Administrador
- **Email:** `admin@gymetra.com`
- **Contraseña:** `admin`
- **Rol:** Admin (role_id: 1)
- **Identificación:** `999999999` (diferente al del script inicial)

### 👥 Usuarios de Prueba
Los usuarios clientes tienen emails del formato: `nombre.apellido@email.com`
- **Contraseña:** `password123` (todos)
- **Rol:** Client (role_id: 2)

**Ejemplos de usuarios:**
- `juan.perez@email.com`
- `maria.garcia@email.com`
- `carlos.rodriguez@email.com`
- ...y 17 más

## 📊 Datos Generados

### Usuarios
- **Total:** 21 usuarios (1 admin + 20 clientes)
- **Estados:** Todos activos
- **Fechas:** Distribuidas en los últimos 30 días

### Membresías
- **Planes disponibles:** Básico ($29.99), Premium ($49.99), Anual ($299.99)
- **Distribución:** Rotativa entre los 3 planes
- **Estado:** Todas CONFIRMED
- **Duración:** 30 días desde la activación

### Pagos
- **Total:** 20 pagos
- **Métodos:** GATEWAY y CARD (alternados)
- **Estados:** 19 CONFIRMED, 1 PENDING
- **Montos:** Según el plan de membresía
- **Referencias:** Generadas automáticamente

### QR Codes
- **Generados para:** Usuarios con membresías activas
- **Formato:** `QR-{user_id}-{timestamp}`
- **Expiración:** 24 horas desde generación
- **Estado:** Active

### Access Logs
- **Total:** 15 registros
- **Sucursales:** Alternadas entre Centro y Norte
- **Tipos:** Ingreso/Salida
- **Fechas:** Distribuidas en las últimas 24 horas

## 🔍 Verificación

Después de ejecutar el script, puedes verificar los datos:

```sql
-- Ver resumen completo
SELECT
    'Usuarios Totales' as tipo, COUNT(*) as cantidad FROM "user"
UNION ALL
SELECT 'Usuarios Admin', COUNT(*) FROM "user" u
    JOIN user_role ur ON u.user_id = ur.user_id
    JOIN role r ON ur.role_id = r.role_id WHERE r.role_name = 'Admin'
UNION ALL
SELECT 'Pagos Confirmados', COUNT(*) FROM payment WHERE status = 'CONFIRMED'
UNION ALL
SELECT 'Membresías Activas', COUNT(*) FROM user_membership WHERE status = 'CONFIRMED';
```

## ⚠️ Notas Importantes

1. **Contraseñas Hasheadas:** Todas las contraseñas están hasheadas con BCrypt (admin usa "admin", clientes usan "password123")
2. **Conflictos:** El script usa `ON CONFLICT DO NOTHING` para evitar duplicados
3. **Admin Identification:** El admin usa `999999999` para evitar conflicto con el script inicial (`123456789`)
4. **Dependencias:** Requiere que las tablas básicas Y membresías existan (del script inicial)
5. **Verificación:** El script verifica automáticamente que las membresías existan
6. **IDs Únicos:** Los identification numbers son únicos y secuenciales
7. **Fechas:** Las fechas están distribuidas para simular uso real del sistema

## 🧪 Testing

Con estos datos puedes probar:

- ✅ **Login administrativo** en `http://localhost:8101/loginadmin`
- ✅ **Panel de administración** con datos reales
- ✅ **Reportes** con 20 pagos para exportar
- ✅ **Gestión de usuarios** con 20 perfiles
- ✅ **Sistema QR** con códigos activos
- ✅ **Logs de acceso** para auditoría

## 🔄 Resetear Datos

Si necesitas limpiar y volver a cargar:

```sql
-- Eliminar datos de prueba (manteniendo estructura)
DELETE FROM access_log;
DELETE FROM qr_access;
DELETE FROM payment;
DELETE FROM user_membership;
DELETE FROM user_role WHERE user_id NOT IN (
    SELECT user_id FROM "user" WHERE identification IN (123456789, 999999999)
); -- Mantener ambos admins
DELETE FROM "user" WHERE identification NOT IN (123456789, 999999999);

-- Recargar datos
\i test_data.sql
```

## 🔧 Solución de Conflictos

### Conflicto de `identification`
Si encuentras el error:
```
ERROR: llave duplicada viola restricción de unicidad «uk_82p55ya4wxjmu3xcguqdmwc16»
Ya existe la llave (identification)=(123456789).
```

**Solución:** El script ya maneja esto automáticamente usando `ON CONFLICT (email) DO UPDATE SET...` para actualizar el usuario existente en lugar de crear uno nuevo.

### Error de `membership_id` nulo
Si encuentras el error:
```
ERROR: el valor nulo en la columna «membership_id» de la relación «user_membership» viola la restricción de no nulo
```

**Solución:** Asegúrate de ejecutar primero el script inicial (`database_\ Initial.sql`) que crea las membresías. El script de test data incluye verificación automática.

### Verificación Final
Después de ejecutar, verifica que todo esté correcto:
```sql
-- Verificar que las membresías existen
SELECT plan_name, price FROM membership;

-- Verificar que el admin existe
SELECT u.email, u.identification, r.role_name
FROM "user" u
JOIN user_role ur ON u.user_id = ur.user_id
JOIN role r ON ur.role_id = r.role_id
WHERE u.email = 'admin@gymetra.com';

-- Verificar membresías de usuario creadas
SELECT COUNT(*) as membresias_activas FROM user_membership WHERE status = 'CONFIRMED';
```

---
**📝 Nota:** Este script es solo para desarrollo y testing. No usar en producción.