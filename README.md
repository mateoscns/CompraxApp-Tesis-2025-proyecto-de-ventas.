<div align="center">

# 🛒 CompraXApp

### Plataforma E-Commerce con Integración de Pagos

[![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)](https://www.microsoft.com/sql-server)
[![MercadoPago](https://img.shields.io/badge/MercadoPago-00B1EA?style=for-the-badge&logo=mercadopago&logoColor=white)](https://www.mercadopago.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

*Sistema integral de comercio electrónico desarrollado como proyecto de tesis*

[Características](#-características) •
[Tecnologías](#-tecnologías) •
[Instalación](#-instalación) •
[API](#-documentación-api) •
[Estructura](#-estructura-del-proyecto)

</div>

---

## 📋 Descripción

**CompraXApp** es una plataforma de comercio electrónico full-stack que permite a los usuarios explorar productos, gestionar carritos de compra, realizar pedidos y procesar pagos de forma segura. El sistema incluye un panel de administración completo para la gestión de productos, usuarios, pedidos y promociones.

### 🎯 Objetivos del Proyecto

- Desarrollar una solución e-commerce escalable y mantenible
- Implementar múltiples métodos de pago (MercadoPago y WhatsApp)
- Crear una experiencia de usuario intuitiva y responsive
- Aplicar buenas prácticas de desarrollo de software

---

## ✨ Características

### 👤 Módulo de Usuario
- ✅ Registro y autenticación de usuarios
- ✅ Verificación de cuenta por email
- ✅ Recuperación de contraseña
- ✅ Gestión de perfil de usuario
- ✅ Historial de pedidos

### 🛍️ Módulo de Productos
- ✅ Catálogo de productos con búsqueda y filtros
- ✅ Visualización detallada de productos
- ✅ Sistema de categorías
- ✅ Gestión de inventario

### 🛒 Módulo de Carrito
- ✅ Agregar/eliminar productos
- ✅ Modificar cantidades
- ✅ Persistencia del carrito por usuario
- ✅ Cálculo automático de totales

### 📦 Módulo de Pedidos
- ✅ Creación de pedidos desde el carrito
- ✅ Seguimiento de estado del pedido
- ✅ Historial completo de órdenes
- ✅ Generación de recibos

### 💳 Módulo de Pagos
- ✅ Integración con **MercadoPago**
- ✅ Coordinación de pagos por **WhatsApp**
- ✅ Confirmación y rechazo de pagos
- ✅ Historial de transacciones

### 🔔 Módulo de Notificaciones
- ✅ Notificaciones en tiempo real
- ✅ Centro de notificaciones
- ✅ Marcado de leídas/no leídas

### 🎫 Módulo de Promociones
- ✅ Creación de descuentos porcentuales
- ✅ Programación por fechas
- ✅ Activación/desactivación

### 👨‍💼 Panel de Administración
- ✅ Dashboard con métricas
- ✅ Gestión de usuarios y roles
- ✅ CRUD de productos
- ✅ Gestión de pedidos
- ✅ Control de pagos
- ✅ Reportes y estadísticas

---

## 🛠️ Tecnologías

### Frontend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Angular | 18.x | Framework de desarrollo web |
| TypeScript | 5.x | Superset tipado de JavaScript |
| RxJS | 7.x | Programación reactiva |
| CSS3 | - | Estilos y diseño responsive |

### Backend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Java | 17+ | Lenguaje de programación |
| Spring Boot | 3.x | Framework de aplicación |
| Spring Security | 6.x | Autenticación y autorización |
| Spring Data JPA | 3.x | Persistencia de datos |
| Hibernate | 6.x | ORM |

### Base de Datos
| Tecnología | Descripción |
|------------|-------------|
| SQL Server | Sistema de gestión de base de datos relacional |

### Integraciones
| Servicio | Descripción |
|----------|-------------|
| MercadoPago SDK | Procesamiento de pagos online |
| JavaMail | Envío de correos de verificación |

---

## 📁 Estructura del Proyecto

```
CompraXApp/
├── 📂 CompraXApp/                    # Backend (Spring Boot)
│   ├── 📂 src/main/java/com/CompraXApp/
│   │   ├── 📂 config/                # Configuraciones
│   │   ├── 📂 controller/            # Controladores REST
│   │   ├── 📂 dto/                   # Data Transfer Objects
│   │   ├── 📂 model/                 # Entidades JPA
│   │   ├── 📂 repository/            # Repositorios
│   │   ├── 📂 security/              # Seguridad
│   │   └── 📂 service/               # Lógica de negocio
│   └── 📂 src/main/resources/
│       └── application.properties    # Configuración
│
├── 📂 CompraXApp-Frontend/           # Frontend (Angular)
│   ├── 📂 src/app/
│   │   ├── 📂 admin/                 # Módulo administración
│   │   ├── 📂 auth/                  # Autenticación
│   │   ├── 📂 cart/                  # Carrito de compras
│   │   ├── 📂 models/                # Modelos TypeScript
│   │   ├── 📂 notifications/         # Sistema de notificaciones
│   │   ├── 📂 order/                 # Gestión de pedidos
│   │   ├── 📂 payment/               # Procesamiento de pagos
│   │   ├── 📂 product/               # Catálogo de productos
│   │   └── 📂 user/                  # Perfil de usuario
│   └── 📂 src/environments/          # Variables de entorno
│
└── 📄 script.sql                     # Script de base de datos
```

---

## 🚀 Instalación

### Prerrequisitos

- **Node.js** >= 18.x
- **Angular CLI** >= 18.x
- **Java JDK** >= 17
- **Maven** >= 3.8
- **SQL Server** >= 2019

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/CompraXApp.git
cd CompraXApp
```

### 2️⃣ Configurar Base de Datos

```sql
-- Ejecutar el script de creación
sqlcmd -S localhost -i script.sql
```

### 3️⃣ Configurar Backend

```bash
cd CompraXApp

# Editar application.properties con tus credenciales
# spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=compraxapp
# spring.datasource.username=tu_usuario
# spring.datasource.password=tu_contraseña

# Compilar y ejecutar
./mvnw spring-boot:run
```

### 4️⃣ Configurar Frontend

```bash
cd CompraXApp-Frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
ng serve
```

### 5️⃣ Acceder a la Aplicación

- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:8080/api

---

## 📚 Documentación API

### Endpoints Principales

| Módulo | Endpoint Base | Descripción |
|--------|---------------|-------------|
| Auth | `/api/auth` | Autenticación y registro |
| Products | `/api/products` | Gestión de productos |
| Cart | `/api/cart` | Carrito de compras |
| Orders | `/api/orders` | Gestión de pedidos |
| Payments | `/api/payments` | Procesamiento de pagos |
| Notifications | `/api/notifications` | Sistema de notificaciones |
| Admin | `/api/admin/*` | Endpoints administrativos |

### Ejemplos de Uso

#### Autenticación
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "contraseña123"
}
```

#### Obtener Productos
```http
GET /api/products
```

#### Agregar al Carrito
```http
POST /api/cart/add?productId=1&quantity=2
```

---

## 🗃️ Modelo de Datos

### Diagrama Entidad-Relación (Simplificado)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │   Product   │       │  Promotion  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ name        │       │ name        │       │ title       │
│ email       │       │ description │       │ discount %  │
│ password    │       │ price       │       │ startDate   │
└──────┬──────┘       │ stock       │       │ endDate     │
       │              └──────┬──────┘       └─────────────┘
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│    Cart     │       │  CartItem   │
├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ cart_id(FK) │
│ user_id(FK) │       │ product(FK) │
└─────────────┘       │ quantity    │
       │              └─────────────┘
       ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Order     │       │  OrderItem  │       │   Payment   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ order_id(FK)│       │ id (PK)     │
│ user_id(FK) │       │ product(FK) │◄──────│ order(FK)   │
│ status      │       │ quantity    │       │ method      │
│ totalAmount │       │ price       │       │ status      │
└─────────────┘       └─────────────┘       └─────────────┘
       │
       ▼
┌─────────────┐
│Notification │
├─────────────┤
│ id (PK)     │
│ user_id(FK) │
│ type        │
│ message     │
└─────────────┘
```

---

## 🔐 Seguridad

- **Autenticación:** Basada en sesiones HTTP con Spring Security
- **Autorización:** Control de acceso por roles (USER, ADMIN)
- **Protección CSRF:** Habilitada para operaciones sensibles
- **Validación:** Sanitización de entradas en frontend y backend
- **Encriptación:** Contraseñas hasheadas con BCrypt

---

## 📸 Capturas de Pantalla

<details>
<summary>Ver capturas de pantalla</summary>

### Página Principal
*[Insertar captura de pantalla]*

### Catálogo de Productos
*[Insertar captura de pantalla]*

### Carrito de Compras
*[Insertar captura de pantalla]*

### Panel de Administración
*[Insertar captura de pantalla]*

</details>

---

## 🧪 Testing

### Backend
```bash
cd CompraXApp
./mvnw test
```

### Frontend
```bash
cd CompraXApp-Frontend
ng test
```

---

## 👥 Autores

| Nombre | Rol | Contacto |
|--------|-----|----------|
| Leandro Mateo Scienza | Desarrollador Full-Stack | [mateoscns@gmail.com] |

---


---

## 🙏 Agradecimientos

- Universidad Tecnologica Nacional
- Tutor de Tesis: Oscar Botta
- Comunidad de Angular y Spring Boot

---


Desarrollado con ❤️ como proyecto de tesis

</div>
