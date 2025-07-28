# 🔧 HERRAMIENTAS DE DIAGNÓSTICO - Firebase

## Botones de Diagnóstico Disponibles

### 1. **🔧 Probar Conexión Directa**
**Función:** Prueba la conexión básica a Firebase
**Qué hace:**
- Verifica que Firestore esté inicializado
- Crea un documento de prueba
- Lee el documento
- Elimina el documento
- Confirma que todas las operaciones funcionan

**Logs esperados:**
```
🧪 FirebaseService: Prueba de conexión directa...
✅ FirebaseService: Firestore está disponible
✅ FirebaseService: Colección de prueba creada
✅ FirebaseService: Documento de prueba creado
✅ FirebaseService: Documento leído correctamente
✅ FirebaseService: Documento de prueba eliminado
🎉 FirebaseService: Prueba de conexión completada exitosamente
```

### 2. **🔒 Verificar Reglas**
**Función:** Verifica específicamente las reglas de Firestore
**Qué hace:**
- Intenta leer la colección de cotizaciones
- Intenta crear un documento de prueba
- Intenta eliminar el documento de prueba
- Verifica permisos de lectura, escritura y eliminación

**Logs esperados:**
```
🔍 FirebaseService: Verificando reglas de Firestore específicamente...
✅ FirebaseService: Reglas permiten lectura de cotizaciones, documentos: X
✅ FirebaseService: Reglas permiten escritura en cotizaciones
✅ FirebaseService: Reglas permiten eliminación en cotizaciones
```

### 3. **🧪 Crear Cotización de Prueba**
**Función:** Crea una cotización de ejemplo
**Qué hace:**
- Crea una cotización con datos de prueba
- La guarda en Firebase
- Recarga la lista de cotizaciones

### 4. **🧪 Crear Datos Completos**
**Función:** Crea tanto cotización como contrato
**Qué hace:**
- Crea una cotización de prueba
- Crea un contrato de prueba
- Recarga las listas

## Diagnóstico Paso a Paso

### PASO 1: Probar Conexión Directa
1. Haz clic en **"🔧 Probar Conexión Directa"**
2. Si funciona: ✅ Conexión básica OK
3. Si falla: ❌ Problema de configuración

### PASO 2: Verificar Reglas
1. Haz clic en **"🔒 Verificar Reglas"**
2. Si funciona: ✅ Reglas OK
3. Si falla: ❌ Problema de reglas de Firestore

### PASO 3: Crear Datos de Prueba
1. Si los pasos anteriores funcionan, haz clic en **"🧪 Crear Datos Completos"**
2. Si funciona: ✅ Todo OK
3. Si falla: ❌ Problema específico de la aplicación

## Errores Comunes y Soluciones

### Error: "permission-denied"
**Causa:** Reglas de Firestore bloquean el acceso
**Solución:** Configurar reglas en Firebase Console

### Error: "Firestore no está inicializado"
**Causa:** Problema de configuración de Firebase
**Solución:** Verificar `app.config.ts`

### Error: "Expected type '_Query', but it was: a custom _CollectionReference object"
**Causa:** Uso incorrecto de `collectionData()`
**Solución:** Ya corregido en el código

## Reglas de Firestore Requeridas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso completo a todas las colecciones
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Verificación Final

### ✅ Indicadores de Éxito:
1. **Conexión directa** funciona
2. **Verificación de reglas** funciona
3. **Creación de datos** funciona
4. **Estadísticas** muestran números > 0
5. **Listas** muestran datos

### ❌ Indicadores de Problema:
1. **Errores** en la consola
2. **Alertas** de error
3. **Estadísticas** en "0"
4. **Listas** vacías

## Comandos de Verificación

```bash
# Verificar que la aplicación esté corriendo
npm start

# Verificar dependencias
npm list @angular/fire

# Verificar configuración
npm run build
```

## Contacto
Si después de usar todas las herramientas de diagnóstico sigue sin funcionar:
1. Comparte los logs completos de la consola
2. Indica qué botones funcionan y cuáles fallan
3. Comparte cualquier mensaje de error específico 