import pypandoc

# Contenido del MR.md basado en la conversación
mr_content = """# 🏋️ Membresías del GYM – Refined Data Model

## 🧭 Conventions
- Tablas y columnas en **snake_case**, en **singular**.  
- Primary keys como **UUID** generadas con `gen_random_uuid()` (`CREATE EXTENSION pgcrypto;`).  
- **Audit fields (7):**  
  - `status`  
  - `created_at` / `created_by`  
  - `updated_at` / `updated_by`  
  - `deleted_at` / `deleted_by`  
- Foreign Keys con **ON UPDATE CASCADE** y **ON DELETE** según reglas de negocio.  
- **Unique constraints** en correos, códigos y nombres.  

---

## Module: Security
- **role** {id, name, description}  
- **user** {id, first_name, last_name, email, password_hash, phone, address}  
- **user_role** {id, user_id, role_id}  

---

## Module: Memberships
- **membership_plan** {id, code, name, duration_months, price, description}  
- **user_membership** {id, user_id, membership_plan_id, start_date, end_date, status}  

---

## Module: Payments
- **payment** {id, user_id, membership_plan_id, amount, method, status, payment_date, reference_code}  

---

## Module: Access Control
- **gym_branch** {id, code, name, address, city, capacity}  
- **access_log** {id, user_id, gym_branch_id, access_time, validated}  

---

## Module: Reports
*(la mayoría se calculan vía SQL queries, pero se puede almacenar histórico si se requiere)*  
- **report** {id, type, generated_at, data (JSON)}  

---

📌 **Ejemplo de relaciones clave**  
- `user` ↔ `role` (N:M vía `user_role`).  
- `user` ↔ `membership_plan` (N:M vía `user_membership`).  
- `payment` está ligado tanto a `user` como a `membership_plan`.  
- `access_log` registra accesos de un `user` en una `gym_branch`.  
"""

# Guardar en un archivo MR.md
output_path = "/mnt/data/MR.md"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(mr_content)

output_path
