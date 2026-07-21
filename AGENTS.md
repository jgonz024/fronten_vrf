# Reglas del Proyecto VRF Systems Frontend

## Política Estricta: Sin Datos en Duro ("No Hardcoded Data Policy")

1. **Prohibido incluir datos simulados ("mock data") en el código**:
   - No utilizar arreglos estáticos de prueba ni credenciales simuladas en clientes API o componentes UI.
   - Todo dato debe ser consumido directamente de la API backend de Next.js.

2. **Prohibido incluir valores por defecto estáticos ("fallback strings")**:
   - No utilizar expresiones como `import.meta.env.VITE_VAR || 'http://...'`.
   - Las URLs de API (`VITE_API_URL`), URL de Backend (`VITE_BACKEND_URL`) y claves de almacenamiento (`VITE_*`) deben provenir exclusivamente de los archivos `.env`.
