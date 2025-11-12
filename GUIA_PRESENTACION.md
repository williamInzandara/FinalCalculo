# GUÍA PARA LA PRESENTACIÓN ORAL (10-15 minutos)

## ESTRUCTURA DE LA PRESENTACIÓN

### 1. INTRODUCCIÓN (2 minutos) - Integrante 1

**Diapositiva 1: Título**
- Nombre del proyecto: graFyApi
- Nombres de los integrantes
- Curso y fecha

**Diapositiva 2: Problema**
- ¿Por qué es difícil visualizar funciones de varias variables?
- Limitaciones de métodos tradicionales (papel, pizarra)
- Necesidad de herramientas interactivas

**Diapositiva 3: Solución**
- Presentar graFyApi como motor de visualización 3D
- Características principales en bullets:
  - ✅ Visualización 3D interactiva
  - ✅ 6 calculadoras matemáticas
  - ✅ 8 superficies predefinidas
  - ✅ Interfaz moderna y amigable

---

### 2. FUNDAMENTOS MATEMÁTICOS (3 minutos) - Integrante 2

**Diapositiva 4: Conceptos Implementados**
- Funciones de dos variables: z = f(x, y)
- Ejemplo visual: paraboloide

**Diapositiva 5: Derivadas y Gradiente**
- Fórmula de derivadas parciales
- Vector gradiente: dirección de máximo crecimiento
- Implementación con diferencias finitas

**Diapositiva 6: Multiplicadores de Lagrange**
- Problema de optimización con restricciones
- Condición: ∇f = λ∇g
- Aplicación práctica

**Diapositiva 7: Integración Doble**
- Cálculo de volumen, masa, centro de masa
- Método numérico: Suma de Riemann

---

### 3. ARQUITECTURA Y TECNOLOGÍAS (2 minutos) - Integrante 3

**Diapositiva 8: Stack Tecnológico**
- Frontend: Next.js 16 + React 19 + TypeScript
- 3D: Three.js + React Three Fiber
- Matemáticas: Math.js + algoritmos propios
- Estilos: Tailwind CSS v4

**Diapositiva 9: Arquitectura de Componentes**
Mostrar diagrama:
\`\`\`
App Principal (page.tsx)
├── Visualizadores 3D
│   ├── Modo Interactivo
│   ├── Campo de Gradientes
│   └── Modo Análisis
└── Calculadoras
    ├── Dominio y Rango
    ├── Límites
    ├── Derivadas
    ├── Lagrange
    ├── Integración
    └── Visualización 2D
\`\`\`

**Diapositiva 10: División de Tareas**
- Tabla mostrando quién hizo qué
- Metodología de trabajo en equipo

---

### 4. DEMOSTRACIÓN EN VIVO (5-6 minutos) - Los 3 integrantes

#### Demo 1: Modo Interactivo (1.5 min) - Integrante 1
1. Abrir aplicación en navegador
2. Mostrar interfaz principal
3. Seleccionar preset "Onda Ondulante"
4. Rotar cámara 360° para mostrar la superficie
5. Cambiar resolución y rango en vivo
6. Mostrar otro preset: "Paraboloide Hiperbólico"

#### Demo 2: Campo de Gradientes (1.5 min) - Integrante 2
1. Cambiar a modo "Gradiente"
2. Mostrar vectores de gradiente
3. Explicar: "Las flechas apuntan hacia arriba de la superficie"
4. Ajustar densidad de vectores (6x6 → 20x20)
5. Cambiar escala de flechas
6. Rotar para ver en 3D

#### Demo 3: Modo Análisis (2.5 min) - Integrante 3
1. Cambiar a modo "Análisis"
2. **Dominio y Rango**: Mostrar puntos críticos detectados
3. **Límites**: Evaluar límite en (0,0)
   - Mostrar resultado de múltiples trayectorias
4. **Derivadas Parciales**: Calcular en punto (1, 1)
   - Mostrar ∂f/∂x, ∂f/∂y y gradiente
5. **Lagrange**: 
   - Ingresar restricción: `x*x + y*y - 9`
   - Encontrar puntos críticos
6. **Integración**: Mostrar volumen calculado
7. **Visualización 2D**: Mapa de calor con restricción

#### Demo 4: Función Personalizada (30 seg) - Integrante 1
1. Ingresar nueva función: `x*x - y*y + sin(t)`
2. Mostrar que se actualiza en tiempo real
3. Cambiar parámetro t con slider

---

### 5. RESULTADOS Y CONCLUSIONES (2 minutos) - Los 3 integrantes

**Diapositiva 11: Resultados Numéricos**
- Mostrar tabla de validación
- Comparar con valores analíticos conocidos
- Precisión: error < 0.1%

**Diapositiva 12: Pruebas de Rendimiento**
- 60 FPS en modo interactivo
- Renderizado < 100ms
- Compatible con todos los navegadores modernos

**Diapositiva 13: Logros**
- ✅ 4 modos de visualización completos
- ✅ 6 calculadoras matemáticas funcionales
- ✅ Interfaz profesional y amigable
- ✅ Algoritmos numéricos precisos

**Diapositiva 14: Mejoras Futuras**
- Exportar gráficas a PDF/PNG
- Funciones de 3 variables (isosuperficies)
- Cálculo simbólico
- Integración con LMS educativos

**Diapositiva 15: Preguntas**
- Agradecer al público
- Abrir espacio para preguntas

---

## TIPS PARA LA PRESENTACIÓN

### Antes de Presentar
- [ ] Probar la aplicación en el proyector/pantalla
- [ ] Tener backup de capturas por si falla internet
- [ ] Ensayar transiciones entre presentadores
- [ ] Cronometrar ensayo completo (debe ser 10-15 min)
- [ ] Preparar respuestas a preguntas comunes

### Durante la Presentación
- **Hablar claro y pausado**
- **Mirar al público, no solo a la pantalla**
- **Usar puntero láser o cursor grande**
- **Cada integrante debe participar equitativamente**
- **NO leer las diapositivas textualmente**
- **Mostrar entusiasmo por el proyecto**

### Preguntas Comunes y Respuestas

**P: ¿Por qué eligieron Next.js en lugar de solo React?**
R: Next.js ofrece renderizado híbrido, optimización automática y mejor rendimiento para producción.

**P: ¿Cómo manejan funciones con discontinuidades?**
R: Validamos que el resultado sea finito (Number.isFinite) y retornamos NaN en caso contrario, lo cual Three.js omite del renderizado.

**P: ¿Qué precisión tienen los cálculos numéricos?**
R: Usamos diferencias finitas centrales con h=0.001, lo que da error < 0.01% para funciones suaves. La integración tiene error < 0.1% con resolución 100x100.

**P: ¿Pueden calcular integrales triples?**
R: Actualmente solo dobles. Integrales triples están en el roadmap de mejoras futuras.

**P: ¿Es open source?**
R: Sí, el código está disponible en GitHub bajo licencia MIT.

---

## DISTRIBUCIÓN DE TIEMPO

| Sección | Tiempo | Presentador |
|---------|--------|-------------|
| Introducción | 2 min | Integrante 1 |
| Fundamentos matemáticos | 3 min | Integrante 2 |
| Arquitectura técnica | 2 min | Integrante 3 |
| Demo en vivo | 5-6 min | Los 3 |
| Conclusiones | 2 min | Los 3 |
| **TOTAL** | **14-15 min** | |

---

## CHECKLIST FINAL

### 1 Semana Antes
- [ ] Diapositivas completas y revisadas
- [ ] Aplicación funcionando perfectamente
- [ ] Backup de capturas de pantalla
- [ ] Script de presentación escrito

### 1 Día Antes
- [ ] Ensayo general completo
- [ ] Probar en computadora de presentación
- [ ] Verificar conexión a internet
- [ ] Preparar vestimenta profesional

### Día de la Presentación
- [ ] Llegar 15 min antes
- [ ] Probar proyector y audio
- [ ] Abrir aplicación en pestaña del navegador
- [ ] Respirar profundo y confiar en su preparación

---

¡Buena suerte con la presentación! 🚀
