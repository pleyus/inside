## Cambios de la version Inside v3.5
- Correcciones menores en filtros de impresion de listas de usuario
- Correcciones en gestion de programas de radio
- Corregidas las estadisticas por municipio
- Se ha actualizado el formato de las referencias
- Usuarios
	- Implementada la búsqueda con comodines.
	- Se incluyo la serialización de numeros de control de los usuarios en la edicion masiva usando el signo de numero
	- Ahora se pueden guardar más numeros de telefono alternos para los usuarios
	- Implementada la impresión de credenciales de los usuarios
	- Agregada la opción de imprimir lista de usuarios
- Aspirantes
	- Agregado el indicador campaña a la lista de aspirantes
	- Se quito el cambió de vistas en aspirantes
	- Ahora se pueden escoger los periodos de promoción de aspirantes
	- Se restringió la creación de notas de aspirantes poco descriptivas
- Se agregaron etiquetas a los filtros de las listas
- Se implemento el banneo de Feedbacks y se incluye la opción de comentario anónimo

### Inside v3.4
- Implementado SSL
- Se soluciono el falso positivo de campaña pagada en aspirantes
- Reparado el boton de nuevo en aspirantes
- Corregidos bugs menores
- Ahora se pueden ordenar las listas
- Se ha agregado el vinculo en los linkers
- Se mejoró la categoría de instituciones para una gestion facil de instituciones
- Corregida la carga interminable en caso de fallo, ahora se muestra un mensaje de despues de 10s de carga sin terminar y la opcion de cerrar el loading para evitar cuelgues.
- Se agregó la marca de «creador» a los aspirantes y usuarios, para tener registro quien lo da de alta
- Estadisticas
	- Se han implementado las estadisticas en aspirantes
	- Se actualizaron los graficos utilizados

### Inside v3.3
- Se redujo este log (el atiguo)
- Ahora los proximos cumpleaños se muestran en portada (aqui al lado)
- Ajustada la forma de cargar la informacion de usuarios al editar.
- Implementado el modulo de mensajes
- Ahora se recaba la información del formulario de contacto del sitio web
- Se puede convertir un mensaje en aspirante
- Mejorado el sistema de notificaciones de nuevos eventos
- Ahora se pueden realizar acciones masivas desde la lista de usuarios
- Optimizadas las cajas de busqueda

### Inside v3.2
- Actualizado el Linker, usado para seleccionar a los usuarios y asignarlos a algun modulo (Busqueda de alumnos en fichas de pago).
- Busqueda con imagenes (cuando este disponible)
- Al pulsar Enter se selecciona el primer elemento
- Actualizada la categoria de Instituciones
- Actualización de aspirantes
- Agregada la notificación de nuevos aspirantes
- Corregida la superposición de la lista de las notas de los aspirantes
- Mejorada la localización de los aspirantes
- Mejorada la busqueda de escuelas de procedencia
- Actualizado el modulo de pagos
- Agregadas casillas de checkeo para imprimir multiples pagos
- Cambiada la forma de busqueda de usuarios (linker)
- Ahora se almacena la especialidad, el nivel y el tipo de usuario a quien se le asignan las fichas
- Cambios generales
	- Rediseñadas las casillas de checkeo
	- Cambiado el modo de impresión

### Inside v3.1
- Mejorado el modulo de seguridad
- Agregada la gestión de permisos en Metadatos de usuario
- Agregadas capacidades individuales para los administradores
- Ampliado el contenedor principal
- Limitado el tamaño de las listas
- Actualizada la vista de datos de usuario
- Actualizada la imagen de usuario
- Agregado el boton de Perfil en edición de aspirante
- Corregidos bugs menores

### Inside v3.0
- Actualizado el motor a Angular6
- Corregidos bugs menores
- Actualizado modulo de Studio3.3 para la gestion de la radio
- Agregado el apartado de programas al modulo de radio
- Agregado el apartado locutores al modulo de radio
- Ahora se puede saber si el remitente de un mensaje de radio cambio de nombre
- Mejorada la interfaz de categorias
- Las fichas de pago ahora pueden contener conceptos mas grandes
- Autocarga de registros recien generados

### Inside v2.9
- Scrollbar adelgazada
- Actualizado el backend del servidor
- Agregado el apartado de radio
- Actualizada la categoria de instituciones
- Implementada la opción de leer mensajes enviados a la radio

### Inside v2.8
- Implementado el log de cambios (este bloque)
- Corregidos problemas menores
- Implementada la opcion de subir _imágenes de usuario_
- Nueva vista de usuarios _Contactos_
- Implementadas las instituciones (escuelas) de procedencia en la información de usuarios
- Agregada la categoria de _instituciones_
- Implementado el seguimiento de actualizaciones
