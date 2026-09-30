# Palcuesco

Tienda web de Palcuesco: palta Hass en su punto, con despacho el mismo día en Santiago.

Los clientes arman su pedido en la página y lo envían a WhatsApp con un botón. El mensaje llega con los productos, la madurez, el total, el nombre y la dirección.

## Qué hay en esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `public/index.html` | La página de la tienda |
| `public/img/` | Logo, íconos y la imagen que aparece al compartir el link |
| `server.js` | El servidor que muestra la página (no necesita instalar nada) |
| `package.json` | Le dice a Railway cómo arrancar el servidor |

## Publicar en Railway

1. Sube esta carpeta a un repositorio de GitHub.
2. En Railway: **New Project → Deploy from GitHub repo** y elige el repositorio.
3. En el servicio, abre **Variables** y agrega:

   | Variable | Ejemplo | ¿Obligatoria? |
   |---|---|---|
   | `WHATSAPP` | `56912345678` (sin +, sin espacios) | Sí |
   | `EMAIL` | `hola@palcuesco.cl` | No |
   | `INSTAGRAM` | `palcuesco` | No (por defecto es `palcuesco`) |

4. En **Settings → Networking**, aprieta **Generate Domain** para tener tu link público.

Cada vez que cambies algo en GitHub, Railway vuelve a publicar la página solo.

## Probar en tu computador

Con Node.js instalado:

```
WHATSAPP=56912345678 npm start
```

Y abre http://localhost:3000
