# ESTRUCTURA DEL CÓDIGO Y MUESTRA DE AUTORÍA
## GYMETRA BACKEND (SPRING BOOT MICROSERVICES)

---

### 1. ÍNDICE JERÁRQUICO DE PAQUETES
La estructura del proyecto sigue las mejores prácticas de **Clean Architecture**, organizando la lógica por capas de responsabilidad:

#### 1.1. Microservicio: GYMETR-login
```text
src/main/java/com/login/GYMETRA/
├── config/         # Configuraciones de AWS y Spring Bean
├── controller/     # Endpoints REST (API Entrypoints)
├── dto/            # Data Transfer Objects (Request/Response)
├── entity/         # Modelos de persistencia (JPA Entities)
├── repository/     # Interfaces de acceso a datos (Spring Data JPA)
├── security/       # Configuración de OAuth2 y JWT
└── service/        # Lógica de negocio (Cognito User Sync)
```

#### 1.2. Microservicio: GYMETR-Membership
```text
src/main/java/com/membership/GYMETRA/
├── controller/     # Gestión de planes y membresías de usuario
├── entity/         # Definición de Membership, UserMembership y Payment
├── repository/     # Consultas de vigencia y estado
└── service/        # Algoritmos de cálculo de fechas y Stripe Integration
```

#### 1.3. Microservicio: GYMETRA - Qr
```text
src/main/java/com/GYMETRA/GYMETRA/qr/
├── controller/     # Endpoints de validación y generación de acceso
├── entity/         # Modelos de QrAccess y logs de entrada
└── service/        # Motor de validación contra servicio de membresías
```

### 2. MUESTRA DE LÓGICA ORIGINAL (CORAZÓN DEL SISTEMA)

A continuación, se presentan fragmentos de código representativos que contienen la lógica original desarrollada por el autor para la coordinación del sistema:

#### 2.1. Sincronización Automática con Proveedor de Identidad
*Archivo: `CognitoUserSyncService.java`*
```java
@Transactional
public User syncUser(Jwt jwt) {
    String sub = jwt.getSubject();
    String email = jwt.getClaimAsString("email");
    Long identification = extractIdentification(jwt);

    // Estrategia: Búsqueda por sub (estable) o vinculación por email/identificación
    return userRepository.findByCognitoSub(sub)
            .map(user -> updateExistingUser(user, jwt))
            .orElseGet(() -> {
                if (identification != null && identification > 0) {
                    return userRepository.findByIdentification(identification)
                            .map(user -> linkAndSyncUser(user, sub, jwt))
                            .orElseGet(() -> tryFindByEmailAndSync(email, sub, jwt));
                }
                return tryFindByEmailAndSync(email, sub, jwt);
            });
}
```

#### 2.2. Algoritmo de Extensión de Vigencia de Membresía
*Archivo: `UserMembershipService.java`*
```java
@Transactional
public UserMembership createOrUpdateMembership(UserMembership newMembership) {
    Integer userId = newMembership.getUserId();
    List<UserMembership> memberships = repository.findByUserIdOrderByEndDateDesc(userId);
    LocalDate today = LocalDate.now();

    if (!memberships.isEmpty()) {
        UserMembership last = memberships.get(0);
        // Si hay una membresía vigente, se suma la duración a la fecha de fin actual
        if (last.getStatus() == UserMembershipStatus.ACTIVE || 
           (last.getEndDate() != null && last.getEndDate().isAfter(today))) {
            
            LocalDate nuevaFechaFin = last.getEndDate().isAfter(today)
                    ? last.getEndDate().plusDays(newMembership.getMembership().getDurationDays())
                    : today.plusDays(newMembership.getMembership().getDurationDays());
            
            newMembership.setStartDate(today);
            newMembership.setEndDate(nuevaFechaFin);
        }
    }
    return repository.save(newMembership);
}
```

#### 2.3. Motor de Validación de Acceso Dinámico
*Archivo: `QrBusinessService.java`*
```java
public QrAccess getOrCreateQrForUser(Long userId) {
    Optional<QrAccess> existing = qrAccessRepository.findFirstByUserIdAndStatus(userId, "active");
    if (existing.isPresent()) {
        QrAccess qr = existing.get();
        // Re-validación periódica contra el servicio de membresías (cada 12 horas)
        if (qr.getGeneratedAt() == null || qr.getGeneratedAt().isBefore(LocalDateTime.now().minusHours(12))) {
            updateQrStatusByMembership(qr);
        }
        return qr;
    } else {
        // Lógica de creación de nuevo token de acceso
        QrAccess newQr = new QrAccess();
        newQr.setUserId(userId);
        newQr.setQrCode(generateQrCode(userId));
        newQr.setStatus(getMembershipStatus(userId) ? "active" : "inactive");
        return qrAccessRepository.save(newQr);
    }
}
```
