package com.GYMETRA.GYMETRA.qr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entidad para almacenar los ejercicios sincronizados desde ExerciseDB.
 * Permite la persistencia de metadatos y el contenido binario de los GIFs.
 */
@Entity
@Table(name = "exercises")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Exercise {

    @Id
    private String id; // ID externo de ExerciseDB (ej: "0001")

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String gifUrl; // URL original de referencia

    /**
     * Contenido binario del archivo GIF. 
     * Se usa JdbcTypeCode(SqlTypes.BINARY) para forzar 'bytea' en PostgreSQL
     * y evitar el error de 'oid'.
     */
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "gif_data")
    private byte[] gifData;

    private String target;

    private String equipment;

    @Column(name = "body_part")
    private String bodyPart;
}
