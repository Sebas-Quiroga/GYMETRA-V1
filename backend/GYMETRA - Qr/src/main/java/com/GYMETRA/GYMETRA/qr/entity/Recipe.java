package com.GYMETRA.GYMETRA.qr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad para almacenar recetas sincronizadas desde Spoonacular.
 * Permite generar planes nutricionales localmente sin llamadas externas.
 */
@Entity
@Table(name = "recipes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recipe {

    @Id
    private Integer id; // ID de Spoonacular (ej: 654321)

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    private String imageUrl;

    private Integer readyInMinutes;

    private Integer servings;

    // Macros
    private Double calories;
    private Double protein;
    private Double fat;
    private Double carbs;

    // Clasificación para el generador local
    private String dietType; // ketogenic, vegetarian, vegan, paleo, etc.
    
    @Column(name = "dish_type")
    private String dishType; // breakfast, main course, side dish, etc.
}
