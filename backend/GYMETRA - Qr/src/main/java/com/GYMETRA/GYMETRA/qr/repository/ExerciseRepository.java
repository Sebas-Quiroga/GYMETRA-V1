package com.GYMETRA.GYMETRA.qr.repository;

import com.GYMETRA.GYMETRA.qr.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, String> {
    
    /**
     * Busca ejercicios por parte del cuerpo.
     */
    List<Exercise> findByBodyPartIgnoreCase(String bodyPart);
    
    /**
     * Busca ejercicios por músculo objetivo.
     */
    List<Exercise> findByTargetIgnoreCase(String target);

    /**
     * Busca ejercicios por equipo.
     */
    List<Exercise> findByEquipmentIgnoreCase(String equipment);

    /**
     * Busca ejercicios por nombre (coincidencia parcial).
     */
    List<Exercise> findByNameContainingIgnoreCase(String name);

    /**
     * Obtener lista única de partes del cuerpo.
     */
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT e.bodyPart FROM Exercise e")
    List<String> findAllBodyParts();

    /**
     * Obtener lista única de músculos objetivo.
     */
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT e.target FROM Exercise e")
    List<String> findAllTargets();

    /**
     * Obtener lista única de equipos.
     */
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT e.equipment FROM Exercise e")
    List<String> findAllEquipment();
}
