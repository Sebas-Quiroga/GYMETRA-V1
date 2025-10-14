package com.Membership.GYMETRA.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inspector")
public class TableInspectorController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/payment-table-structure")
    public String getPaymentTableStructure() {
        String sql = """
            SELECT 
                column_name, 
                data_type, 
                is_nullable, 
                column_default,
                ordinal_position
            FROM information_schema.columns 
            WHERE table_name = 'payment' 
            ORDER BY ordinal_position
            """;
        
        List<Map<String, Object>> columns = jdbcTemplate.queryForList(sql);
        
        System.out.println("🔍 ESTRUCTURA COMPLETA DE LA TABLA PAYMENT:");
        System.out.println("=".repeat(80));
        
        StringBuilder result = new StringBuilder();
        result.append("<h1>Estructura de la tabla Payment</h1>");
        result.append("<table border='1' style='border-collapse: collapse;'>");
        result.append("<tr><th>Pos</th><th>Column Name</th><th>Data Type</th><th>Nullable</th><th>Default</th></tr>");
        
        for (Map<String, Object> column : columns) {
            System.out.println(String.format("   %2d. %-20s %-15s %-8s %s", 
                column.get("ordinal_position"),
                column.get("column_name"),
                column.get("data_type"),
                column.get("is_nullable"),
                column.get("column_default")
            ));
            
            result.append("<tr>");
            result.append("<td>").append(column.get("ordinal_position")).append("</td>");
            result.append("<td>").append(column.get("column_name")).append("</td>");
            result.append("<td>").append(column.get("data_type")).append("</td>");
            result.append("<td>").append(column.get("is_nullable")).append("</td>");
            result.append("<td>").append(column.get("column_default")).append("</td>");
            result.append("</tr>");
        }
        
        result.append("</table>");
        System.out.println("=".repeat(80));
        
        return result.toString();
    }
}