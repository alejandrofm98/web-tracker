# Tasks

## 1. Corrección local

- [x] 1.1 Registrar dependencias y avisos anteriores, diferenciando herramientas y runtime.
- [x] 1.2 Aplicar actualizaciones compatibles y fijar runtime Node con parche de seguridad; migrar Next a 16.4.2 porque no se publica una versión corregida 14.x.
- [x] 1.3 Repetir auditoría, compilación, lint, tipos y pruebas locales; verificar `npm audit --omit=dev` sin avisos y Compose.
- [x] 1.4 Revisar el diff de forma independiente y documentar limitaciones.

## 2. Publicación y despliegue

- [x] 2.1 Con autorización del usuario, verificar remoto `origin`, rama `master` y Auto Deploy de producción; publicar el commit.
- [ ] 2.2 Esperar `Done` para el commit publicado y comprobar salud pública antes de pasar al siguiente proyecto.
- [x] 2.3 Registrar avisos de desarrollo aún sin parche publicado y comprobar que no forman parte de la imagen runtime.
