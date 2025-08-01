# API Endpoints para Roles y Departamentos

Este documento describe los endpoints necesarios en el backend para soportar la funcionalidad dinámica de roles y departamentos.

## Endpoints Requeridos

### 1. Obtener Roles
```
GET http://localhost:3006/roles?includeInactive=false
```

**Respuesta esperada:**
```json
{
  "success": true,
  "roles": [
    "Administrador del Sistema",
    "Director General",
    "Gerente",
    "Supervisor",
    "Jefe de Departamento",
    "Coordinador",
    "Analista",
    "Especialista",
    "Técnico",
    "Asistente",
    "Empleado",
    "Operador",
    "Consultor",
    "Usuario Final",
    "Solo Lectura"
  ],
  "message": "Roles obtenidos correctamente"
}
```

### 2. Obtener Departamentos
```
GET http://localhost:3006/departments?includeInactive=false
```

**Respuesta esperada:**
```json
{
  "success": true,
  "departments": [
    "Administración",
    "Recursos Humanos",
    "Finanzas y Contabilidad",
    "Tecnología de la Información",
    "Marketing y Ventas",
    "Operaciones y Producción",
    "Logística y Almacén",
    "Calidad y Control",
    "Investigación y Desarrollo",
    "Compras y Adquisiciones",
    "Atención al Cliente",
    "Legal y Cumplimiento",
    "Seguridad y Salud Ocupacional",
    "Mantenimiento",
    "Dirección General"
  ],
  "message": "Departamentos obtenidos correctamente"
}
```

## Implementación Actual en Frontend

### Hooks utilizados:
- `useGetRoles()` - Obtiene la lista de roles desde la API
- `useGetDepartments()` - Obtiene la lista de departamentos desde la API

### Características:
- **Caching**: Los datos se cachean usando SWR para mejorar el rendimiento
- **Estados de carga**: Los componentes muestran indicadores de carga mientras se obtienen los datos
- **Manejo de errores**: Preparado para manejar errores de API
- **Revalidación**: Configurado para no revalidar automáticamente para datos que cambian poco

### Ubicaciones donde se usan:
1. **FormUserAdd.tsx** - Formulario de creación/edición de usuarios
2. **Profile/index.tsx** - Sección del usuario logueado (muestra rol y departamento)

## Beneficios de la Implementación Dinámica

1. **Escalabilidad**: Fácil agregar/remover roles y departamentos sin cambios en el frontend
2. **Mantenimiento**: Centralizada la gestión de roles y departamentos en el backend
3. **Consistencia**: Garantiza que todos los formularios usen los mismos valores
4. **Performance**: Cache inteligente reduce las llamadas innecesarias a la API
5. **UX**: Indicadores de carga y estados de error mejorados

## Configuración de SWR

Los hooks están configurados con:
- `revalidateIfStale: false` - No revalida datos obsoletos automáticamente
- `revalidateOnFocus: false` - No revalida cuando la ventana toma foco
- `revalidateOnReconnect: false` - No revalida al reconectarse

Esto es ideal para datos que cambian raramente como roles y departamentos organizacionales.

## Fallbacks

Si la API no está disponible, el sistema mantiene funcionalidad:
- Arrays vacíos por defecto
- Estados de error manejados
- Indicadores de carga apropiados
- Mensajes informativos al usuario

## Próximos Pasos

Para una implementación más avanzada, se podrían agregar:
1. Gestión de permisos por rol
2. Jerarquías de departamentos
3. Roles personalizados por usuario
4. Auditoria de cambios de roles/departamentos
