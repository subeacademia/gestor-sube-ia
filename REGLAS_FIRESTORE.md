# 🔥 Reglas de Firestore - Configuración Requerida

## Problema
Las reglas de Firestore pueden estar bloqueando el acceso a los datos. Necesitas configurar las reglas correctamente.

## Solución

### 1. Ir a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `cotizador-bba5a`
3. En el menú lateral, ve a **"Firestore Database"**
4. Haz clic en la pestaña **"Rules"**

### 2. Configurar las Reglas
Reemplaza las reglas existentes con estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso completo a cotizaciones
    match /cotizaciones/{document} {
      allow read, write: if true;
    }
    
    // Permitir acceso completo a contratos
    match /contratos/{document} {
      allow read, write: if true;
    }
    
    // Permitir acceso a todas las colecciones (temporalmente)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. Publicar las Reglas
1. Haz clic en **"Publish"** para guardar las reglas
2. Espera unos segundos a que se publiquen

### 4. Verificar en la Aplicación
1. Recarga la página de la aplicación
2. Abre la consola del navegador (F12)
3. Busca mensajes de éxito:
   ```
   ✅ FirebaseService: Reglas permiten lectura, documentos encontrados: X
   ```

## Reglas de Producción (Más Seguras)

Una vez que todo funcione, puedes usar reglas más seguras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso solo a usuarios autenticados
    match /cotizaciones/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /contratos/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Verificación

### Logs Esperados en la Consola:
```
🔍 FirebaseService: Verificando reglas de Firestore...
✅ FirebaseService: Reglas permiten lectura, documentos encontrados: X
✅ FirebaseService: Configuración de Firebase correcta
```

### Si Hay Errores:
```
❌ FirebaseService: Error de reglas de Firestore: permission-denied
🚨 FirebaseService: Las reglas de Firestore están bloqueando el acceso
```

## Comandos de Verificación

```bash
# Verificar que la aplicación esté corriendo
npm start

# Verificar las dependencias de Firebase
npm list @angular/fire
```

## Contacto
Si después de configurar las reglas sigue sin funcionar, comparte los logs de la consola para un diagnóstico más detallado. 