package com.GYMETRA.GYMETRA.qr.repository;

import com.GYMETRA.GYMETRA.qr.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Integer> {

    @Query(value = "SELECT * FROM recipes WHERE dish_type ILIKE %:type% AND calories <= :maxCal ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Recipe> findRandomByDishTypeAndMaxCalories(@Param("type") String type, @Param("maxCal") Double maxCal, @Param("limit") int limit);

    @Query(value = "SELECT * FROM recipes WHERE diet_type ILIKE %:diet% AND dish_type ILIKE %:type% AND calories <= :maxCal ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Recipe> findRandomByDietAndDishTypeAndMaxCalories(@Param("diet") String diet, @Param("type") String type, @Param("maxCal") Double maxCal, @Param("limit") int limit);
}
