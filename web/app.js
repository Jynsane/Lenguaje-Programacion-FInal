// Lógica Frontend: Interactividad del Mapa, Chatbot y Consumo de APIs

// Estado global de la aplicación
const state = {
    sintomasTodos: [],
    sintomasSeleccionados: new Set(),
    zonaSeleccionada: "todos",
    ultimoResultado: null
};

// Mapeo de partes del cuerpo a sus síntomas asociados
const mapeoZonaSintomas = {
    "part-head": [
        "dolor_de_cabeza", "congestion_nasal", "dolor_facial", 
        "dolor_de_oido", "mareos", "perdida_de_olfato", 
        "perdida_de_gusto", "fiebre", "escalofrios"
    ],
    "part-neck": [
        "dolor_de_garganta"
    ],
    "part-chest": [
        "tos", "dificultad_para_respirar", "dolor_de_pecho", 
        "tos_con_esputo", "fatiga"
    ],
    "part-abdomen": [
        "nauseas", "vomitos", "diarrea", "dolor_abdominal", 
        "perdida_de_apetito", "fatiga"
    ],
    "part-pelvis": [
        "disuria", "fiebre"
    ],
    "part-left-arm": [
        "dolor_muscular", "erupcion_cutanea", "fatiga"
    ],
    "part-right-arm": [
        "dolor_muscular", "erupcion_cutanea", "fatiga"
    ],
    "part-left-leg": [
        "dolor_muscular", "erupcion_cutanea", "fatiga"
    ],
    "part-right-leg": [
        "dolor_muscular", "erupcion_cutanea", "fatiga"
    ]
};

// Traducciones legibles de los IDs de síntomas a español
const traduccionSintomas = {
    "fiebre": "Fiebre",
    "tos": "Tos",
    "dolor_de_garganta": "Dolor de Garganta",
    "congestion_nasal": "Congestión Nasal",
    "dolor_de_cabeza": "Dolor de Cabeza",
    "fatiga": "Fatiga / Cansancio",
    "dolor_muscular": "Dolor Muscular",
    "escalofrios": "Escalofríos",
    "nauseas": "Náuseas",
    "vomitos": "Vómitos",
    "diarrea": "Diarrea",
    "dolor_abdominal": "Dolor Abdominal",
    "perdida_de_olfato": "Pérdida de Olfato",
    "perdida_de_gusto": "Pérdida de Gusto",
    "dificultad_para_respirar": "Dificultad para Respirar",
    "erupcion_cutanea": "Erupción Cutánea / Ronchas",
    "dolor_de_pecho": "Dolor de Pecho",
    "mareos": "Mareos",
    "sudoracion_nocturna": "Sudoración Nocturna",
    "perdida_de_peso": "Pérdida de Peso",
    "dolor_de_oido": "Dolor de Oído",
    "disuria": "Dolor al Orinar (Disuria)",
    "dolor_facial": "Dolor Facial (Sinus)",
    "tos_con_esputo": "Tos con Flemas (Esputo)",
    "perdida_de_apetito": "Pérdida de Apetito"
};

// Nombres legibles para las partes del cuerpo
const nombresZonas = {
    "part-head": "Cabeza y Cara",
    "part-neck": "Cuello y Garganta",
    "part-chest": "Pecho y Pulmones",
    "part-abdomen": "Abdomen y Estómago",
    "part-pelvis": "Vías Urinarias / Pelvis",
    "part-left-arm": "Brazo Izquierdo",
    "part-right-arm": "Brazo Derecho",
    "part-left-leg": "Pierna Izquierda",
    "part-right-leg": "Pierna Derecha",
    "todos": "Todo el Cuerpo"
};

// Elementos del DOM
const elSintomasCheckbox = document.getElementById("symptoms-checkboxes");
const elNombreZonaActiva = document.getElementById("selected-area-name");
const elSintomasContador = document.getElementById("selected-symptoms-count");
const elChatForm = document.getElementById("chat-form");
const elChatInput = document.getElementById("chat-input");
const elChatBox = document.getElementById("chat-box");
const elUrgenciaBanner = document.getElementById("urgency-banner");
const elUrgenciaTexto = document.getElementById("urgency-text");
const elConsensoResultados = document.getElementById("consensus-results");
const elPrologResultados = document.getElementById("prolog-results");
const elMLResultados = document.getElementById("ml-results");
const elBtnDiagnosticar = document.getElementById("btn-diagnosticar");
const elBtnPdf = document.getElementById("btn-pdf");
const elPacienteNombre = document.getElementById("patient-name");
const elPacienteEdad = document.getElementById("patient-age");
const elToast = document.getElementById("toast");

// Bucle de verificación de salud de los microservicios
async function ejecutarHealthChecks() {
    const elScalaDot = document.querySelector("#status-scala .dot");
    const elPrologDot = document.querySelector("#status-prolog .dot");
    const elPythonDot = document.querySelector("#status-python .dot");

    try {
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        elScalaDot.className = data.scala ? "dot green" : "dot red";
        elPrologDot.className = data.prolog ? "dot green" : "dot red";
        elPythonDot.className = data.python ? "dot green" : "dot red";
    } catch (err) {
        elScalaDot.className = "dot red";
        elPrologDot.className = "dot red";
        elPythonDot.className = "dot red";
    }
}

// Carga Inicial
window.addEventListener("DOMContentLoaded", async () => {
    inicializarMapaCorporal();
    await cargarSintomas();
    
    // Escuchar submit de chat
    elChatForm.addEventListener("submit", manejarMensajeChat);
    
    // Escuchar clics de diagnóstico y pdf
    elBtnDiagnosticar.addEventListener("click", ejecutarDiagnostico);
    elBtnPdf.addEventListener("click", descargarReportePDF);

    // Iniciar bucle de verificación de salud
    ejecutarHealthChecks();
    setInterval(ejecutarHealthChecks, 5000);
});

// Cargar la lista completa de síntomas desde Scala API
async function cargarSintomas() {
    try {
        const res = await fetch("/api/sintomas");
        if (!res.ok) throw new Error("Fallo al obtener síntomas");
        state.sintomasTodos = await res.json();
        renderizarSintomasCheckboxes();
    } catch (err) {
        showToast("Error cargando síntomas de la API de Scala.");
        console.error(err);
    }
}

// Renderizar la lista de checkboxes de síntomas (filtrando por la zona activa)
function renderizarSintomasCheckboxes() {
    elSintomasCheckbox.innerHTML = "";
    
    // Filtrar: si la zona es "todos", mostrar todos. Si no, mostrar los de la zona y los que YA estén seleccionados
    const sintomasFiltrados = state.sintomasTodos.filter(s => {
        if (state.zonaSeleccionada === "todos") return true;
        const sintomasZona = mapeoZonaSintomas[state.zonaSeleccionada] || [];
        return sintomasZona.includes(s) || state.sintomasSeleccionados.has(s);
    });

    if (sintomasFiltrados.length === 0) {
        elSintomasCheckbox.innerHTML = `<div class="placeholder-text">No hay síntomas específicos.</div>`;
        return;
    }

    sintomasFiltrados.forEach(s => {
        const label = document.createElement("label");
        label.className = `symptom-label ${state.sintomasSeleccionados.has(s) ? 'checked' : ''}`;
        
        const isChecked = state.sintomasSeleccionados.has(s) ? "checked" : "";
        const trad = traduccionSintomas[s] || s.replace("_", " ");
        
        label.innerHTML = `
            <input type="checkbox" value="${s}" ${isChecked}>
            <span>${trad}</span>
        `;
        
        // Escuchar clics en el checkbox
        const checkbox = label.querySelector("input");
        checkbox.addEventListener("change", (e) => {
            if (e.target.checked) {
                state.sintomasSeleccionados.add(s);
                label.classList.add("checked");
            } else {
                state.sintomasSeleccionados.delete(s);
                label.classList.remove("checked");
            }
            actualizarContadorSintomas();
            // Ejecutar diagnóstico automático
            ejecutarDiagnosticoSilencioso();
        });
        
        elSintomasCheckbox.appendChild(label);
    });
}

// Configurar los eventos de clic en el SVG del cuerpo humano
function inicializarMapaCorporal() {
    const parts = document.querySelectorAll(".body-part");
    parts.forEach(part => {
        part.addEventListener("click", () => {
            const id = part.getAttribute("id");
            
            // Si el clic fue en la parte ya activa, la desactivamos
            if (part.classList.contains("active")) {
                part.classList.remove("active");
                state.zonaSeleccionada = "todos";
                elNombreZonaActiva.textContent = nombresZonas["todos"];
            } else {
                // Quitar activa a todos y poner a esta
                parts.forEach(p => p.classList.remove("active"));
                part.classList.add("active");
                state.zonaSeleccionada = id;
                elNombreZonaActiva.textContent = nombresZonas[id] || id;
            }
            
            renderizarSintomasCheckboxes();
        });
    });
}

function actualizarContadorSintomas() {
    elSintomasContador.textContent = state.sintomasSeleccionados.size;
}

// Mostrar mensajes Toast
function showToast(message) {
    elToast.textContent = message;
    elToast.classList.remove("hidden");
    setTimeout(() => {
        elToast.classList.add("hidden");
    }, 3500);
}

// Agregar burbuja de mensaje al Chat
function agregarMensajeChat(remitente, texto) {
    const div = document.createElement("div");
    div.className = `message ${remitente}`;
    if (remitente === "assistant") {
        // Permitir formato HTML y saltos de línea para el asistente
        div.innerHTML = texto.replace(/\n/g, "<br>");
    } else {
        div.textContent = texto;
    }
    elChatBox.appendChild(div);
    elChatBox.scrollTop = elChatBox.scrollHeight;
}

// Genera una recomendación empática y cálida del médico ficticio
function obtenerRecomendacionDoctor(sintomas) {
    let saludo = "Entiendo perfectamente cómo te sientes, y lamento mucho que estés pasando por este malestar. Como tu doctor virtual, he tomado nota de lo que me comentas y ya he marcado en tu panel los siguientes síntomas: ";
    
    const nombresSintomas = sintomas.map(s => `<b>${traduccionSintomas[s] || s}</b>`);
    let listado = "";
    if (nombresSintomas.length === 1) {
        listado = nombresSintomas[0];
    } else {
        listado = nombresSintomas.slice(0, -1).join(", ") + " y " + nombresSintomas.slice(-1);
    }
    
    let recomendacion = "\n\n<b>Mientras preparamos tu diagnóstico completo, te sugiero seguir estas recomendaciones iniciales para cuidarte:</b>\n";
    let tieneRecomendacion = false;
    let esCritico = false;

    if (sintomas.includes("dificultad_para_respirar") || sintomas.includes("dolor_de_pecho")) {
        recomendacion += "• 🚨 <b>Atención Prioritaria:</b> La dificultad para respirar o el dolor de pecho son síntomas de alerta crítica. Por favor, <b>no esperes</b> y acude de inmediato a un centro de urgencias o consulta a un médico presencial.\n";
        esCritico = true;
        tieneRecomendacion = true;
    }
    
    if (sintomas.includes("fiebre") || sintomas.includes("escalofrios") || sintomas.includes("sudoracion_nocturna")) {
        recomendacion += "• 🌡️ <b>Control de Fiebre:</b> Mantén un registro de tu temperatura. Bebe abundantes líquidos (agua o suero oral) para evitar la deshidratación y descansa con ropa ligera.\n";
        tieneRecomendacion = true;
    }
    
    if (sintomas.includes("dolor_de_garganta") || sintomas.includes("tos") || sintomas.includes("congestion_nasal") || sintomas.includes("tos_con_esputo") || sintomas.includes("dolor_facial")) {
        // Síntomas respiratorios leves
        recomendacion += "• 💧 <b>Alivio Respiratorio:</b> Mantén tus vías respiratorias hidratadas. Toma bebidas tibias como té con limón y miel, realiza gárgaras de agua tibia con una pizca de sal, y evita exponerte a corrientes de aire frío o al humo.\n";
        tieneRecomendacion = true;
    }
    
    if (sintomas.includes("nauseas") || sintomas.includes("vomitos") || sintomas.includes("diarrea") || sintomas.includes("dolor_abdominal") || sintomas.includes("perdida_de_apetito")) {
        recomendacion += "• 🍌 <b>Cuidado Estomacal:</b> Reposa tu sistema digestivo. Lleva una dieta blanda (arroz blanco, manzana, gelatina, pollo hervido) y toma suero oral en sorbos pequeños pero constantes para reponer los electrolitos perdidos.\n";
        tieneRecomendacion = true;
    }
    
    if (sintomas.includes("dolor_muscular") || sintomas.includes("dolor_de_cabeza") || sintomas.includes("fatiga")) {
        recomendacion += "• 🛌 <b>Descanso Obligatorio:</b> El cansancio, dolor de cabeza o malestar muscular son señales de que tu cuerpo necesita energía para recuperarse. Evita esfuerzos físicos y descansa en una habitación tranquila.\n";
        tieneRecomendacion = true;
    }
    
    if (sintomas.includes("mareos")) {
        recomendacion += "• 🌀 <b>Prevención de Mareos:</b> Evita realizar cambios bruscos de postura o incorporarte rápido. Permanece sentado o recostado en una posición cómoda para evitar caídas y mantén la mirada en un punto fijo si sientes inestabilidad.\n";
        tieneRecomendacion = true;
    }
    
    if (!tieneRecomendacion) {
        recomendacion += "• 🩺 <b>Cuidados Generales:</b> Guarda reposo, evita la automedicación de antibióticos y mantente bien hidratado.\n";
    }

    recomendacion += "\nRecuerda que estas sugerencias son meramente orientativas y no reemplazan el diagnóstico de un médico colegiado. ";
    if (!esCritico) {
        recomendacion += "He actualizado el panel de la derecha con tu diagnóstico preliminar. ¿Cómo te sientes al respecto?";
    } else {
        recomendacion += "Por favor, prioriza tu salud y busca asistencia médica profesional lo antes posible.";
    }

    return saludo + listado + "." + recomendacion;
}

// Función de seguridad para detectar palabras clave de riesgo vital
function esEmergenciaCritica(texto) {
    const textoLimpio = texto.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quitar acentos
    
    const palabrasAlarma = [
        "desmay", "inconsciente", "perdi el conocimiento", "desvaneci", "desvanece",
        "sangr", "hemorragia", "convulsion", "asfixia", "no puedo respirar",
        "infarto", "paro cardiaco", "envenena", "intoxica", "emergencia", "morirme"
    ];
    
    return palabrasAlarma.some(palabra => textoLimpio.includes(palabra));
}

// Procesar el chat de entrada con NLP en el servidor
async function manejarMensajeChat(e) {
    e.preventDefault();
    const texto = elChatInput.value.trim();
    if (!texto) return;
    
    // Limpiar input y agregar mensaje del usuario
    elChatInput.value = "";
    agregarMensajeChat("user", texto);
    
    try {
        // Enviar al Gateway de Scala el cual procesará NLP con Python
        const res = await fetch("/api/analizar-texto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texto: texto })
        });
        
        if (!res.ok) throw new Error("Error en respuesta de NLP");
        
        const data = await res.json();
        const sintomasDetectados = data.sintomas || [];
        
        if (sintomasDetectados.length > 0) {
            // Agregar al Set de seleccionados
            sintomasDetectados.forEach(s => state.sintomasSeleccionados.add(s));
            actualizarContadorSintomas();
            
            // Re-renderizar checkboxes para que se muestren marcados
            renderizarSintomasCheckboxes();
            
            // Generar respuesta cálida de médico
            const respuestaDoctor = obtenerRecomendacionDoctor(sintomasDetectados);
            agregarMensajeChat("assistant", respuestaDoctor);
            
            // Ejecutar diagnóstico automático
            ejecutarDiagnostico();
        } else {
            // Verificar si es una emergencia crítica
            if (esEmergenciaCritica(texto)) {
                agregarMensajeChat("assistant", "🚨 <b>¡ADVERTENCIA DE EMERGENCIA CRÍTICA!</b><br><br>Lamento mucho escuchar lo que estás pasando. Aunque tu descripción contiene palabras que no están en nuestra base de datos de diagnóstico estándar (como desmayos o sangrado), estas señales sugieren un <b>riesgo de salud inmediato</b>.<br><br>Por favor, <b>no pierdas tiempo con esta aplicación</b> y acude de inmediato a la sala de emergencias más cercana o llama a los servicios médicos de urgencia de tu localidad.");
            } else {
                agregarMensajeChat("assistant", "Lamento mucho escuchar que te sientes mal, pero no he logrado identificar síntomas específicos en tu descripción (como fiebre, tos, dolor, etc.).\n\n¿Podrías detallarme un poco más en qué parte de tu cuerpo sientes la molestia o qué te duele exactamente? También puedes marcarlos directamente en el mapa corporal de la izquierda.");
            }
        }
        
    } catch (err) {
        agregarMensajeChat("assistant", "Mis disculpas. He tenido un pequeño inconveniente técnico al intentar procesar tus síntomas. Por favor, intenta de nuevo o selecciona los síntomas manualmente en el mapa corporal.");
        console.error(err);
    }
}

// Ejecutar diagnóstico silencioso (mientras hace clics) para actualizar en vivo
async function ejecutarDiagnosticoSilencioso() {
    if (state.sintomasSeleccionados.size === 0) {
        limpiarResultados();
        return;
    }
    await realizarDiagnosticoAPI(false);
}

// Ejecutar diagnóstico formal por botón o chat
async function ejecutarDiagnostico() {
    if (state.sintomasSeleccionados.size === 0) {
        showToast("Por favor, selecciona al menos un síntoma.");
        return;
    }
    await realizarDiagnosticoAPI(true);
}

// Consulta principal al API Gateway de Scala
async function realizarDiagnosticoAPI(mostrarToasts) {
    const nombre = elPacienteNombre.value.trim();
    const edadInput = elPacienteEdad.value.trim();
    
    // Validación local estricta
    if (!nombre) {
        if (mostrarToasts) {
            showToast("Por favor ingrese el nombre del paciente.");
            elPacienteNombre.focus();
        }
        return;
    }
    if (!edadInput || isNaN(edadInput) || parseInt(edadInput) <= 0 || parseInt(edadInput) > 120) {
        if (mostrarToasts) {
            showToast("Por favor ingrese una edad válida (entre 1 y 120 años).");
            elPacienteEdad.focus();
        }
        return;
    }
    if (state.sintomasSeleccionados.size === 0) {
        if (mostrarToasts) {
            showToast("Por favor, selecciona al menos un síntoma.");
        }
        return;
    }

    const edad = parseInt(edadInput);
    const sintomas = Array.from(state.sintomasSeleccionados);

    // Agregar estado de carga visual al botón
    elBtnDiagnosticar.classList.add("btn-loading");
    elBtnDiagnosticar.disabled = true;

    try {
        const res = await fetch("/api/diagnosticar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: nombre,
                edad: edad,
                sintomas: sintomas
            })
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Fallo en el servicio de diagnóstico.");
        }

        const resultado = await res.json();
        state.ultimoResultado = resultado;
        
        // Renderizar los resultados
        renderizarResultados(resultado);
        if (mostrarToasts) showToast("Diagnóstico actualizado exitosamente.");

    } catch (err) {
        showToast(err.message || "Error de conexión al servidor de Scala.");
        console.error(err);
    } finally {
        // Quitar estado de carga
        elBtnDiagnosticar.classList.remove("btn-loading");
        elBtnDiagnosticar.disabled = false;
    }
}

// Renderizar la información devuelta por el Backend
function renderizarResultados(res) {
    // 1. Urgencia
    if (res.esUrgente) {
        elUrgenciaBanner.className = "urgency-banner urgent";
        elUrgenciaBanner.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>Urgente: ¡Consulte a emergencias!</span>`;
    } else {
        elUrgenciaBanner.className = "urgency-banner stable";
        elUrgenciaBanner.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Estado: Estable</span>`;
    }

    // 2. Consenso (Enfermedades consolidadas)
    elConsensoResultados.innerHTML = "";
    if (res.enfermedades && res.enfermedades.length > 0) {
        res.enfermedades.forEach(enf => {
            const card = document.createElement("div");
            card.className = "consensus-card";
            
            // Buscar si tiene porcentaje en ML
            const mlMatch = res.prediccionesML.find(m => m.enfermedad === enf);
            const probStr = mlMatch ? `${mlMatch.probabilidad}% prob.` : "Verificado";
            
            card.innerHTML = `
                <span class="name">${enf.replace("_", " ").toUpperCase()}</span>
                <span class="badge">${probStr}</span>
            `;
            elConsensoResultados.appendChild(card);
        });
    } else {
        elConsensoResultados.innerHTML = `<div class="placeholder-text">Ninguna sospecha consolidada clara.</div>`;
    }

    // 3. Resultados Prolog
    elPrologResultados.innerHTML = "";
    if (res.diagnosticosProlog && res.diagnosticosProlog.length > 0) {
        res.diagnosticosProlog.forEach(enf => {
            const li = document.createElement("li");
            li.innerHTML = `<i class="fa-solid fa-square-check"></i> Regla médica activa: <b>${enf.replace("_", " ").toUpperCase()}</b>`;
            elPrologResultados.appendChild(li);
        });
    } else {
        elPrologResultados.innerHTML = `<li class="placeholder-text">Ninguna regla clínica se cumple exactamente.</li>`;
    }

    // 4. Resultados Python ML
    elMLResultados.innerHTML = "";
    if (res.prediccionesML && res.prediccionesML.length > 0) {
        res.prediccionesML.forEach(pred => {
            const div = document.createElement("div");
            div.className = "bar-container";
            
            const labelStr = pred.enfermedad.replace("_", " ").toUpperCase();
            
            div.innerHTML = `
                <div class="bar-label">
                    <span>${labelStr}</span>
                    <strong>${pred.probabilidad}%</strong>
                </div>
                <div class="bar-outer">
                    <div class="bar-inner" style="width: ${pred.probabilidad}%"></div>
                </div>
            `;
            elMLResultados.appendChild(div);
        });
    } else {
        elMLResultados.innerHTML = `<div class="placeholder-text">Sin predicción estadística.</div>`;
    }

    // Activar botón PDF
    elBtnPdf.disabled = false;
}

// Limpiar el dashboard cuando no hay síntomas
function limpiarResultados() {
    elUrgenciaBanner.className = "urgency-banner stable";
    elUrgenciaBanner.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Estado: Estable</span>`;
    
    elConsensoResultados.innerHTML = `<div class="placeholder-text">Selecciona síntomas para ver el consenso</div>`;
    elPrologResultados.innerHTML = `<li class="placeholder-text">Esperando validación lógica...</li>`;
    elMLResultados.innerHTML = `<div class="placeholder-text">Esperando estimación de Machine Learning...</div>`;
    
    elBtnPdf.disabled = true;
    state.ultimoResultado = null;
}

// Enviar petición de generación de PDF al Gateway de Scala y descargarlo
async function descargarReportePDF() {
    if (!state.ultimoResultado) return;
    
    // Cambiar estado del botón a carga
    elBtnPdf.classList.add("btn-loading");
    elBtnPdf.disabled = true;

    try {
        showToast("Generando reporte PDF...");
        
        // El último resultado tiene paciente, enfermedades, esUrgente, diagnosticosProlog, prediccionesML
        const res = await fetch("/api/generar-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: state.ultimoResultado.nombre,
                edad: state.ultimoResultado.edad,
                sintomas: state.ultimoResultado.sintomas,
                diagnosticos_prolog: state.ultimoResultado.diagnosticosProlog,
                diagnosticos_ml: state.ultimoResultado.prediccionesML,
                es_urgente: state.ultimoResultado.esUrgente
            })
        });
        
        if (!res.ok) throw new Error("Fallo al descargar PDF");
        
        // Obtener Blob binario
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reporte_${state.ultimoResultado.nombre.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Limpiar
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast("Reporte descargado exitosamente.");
        
    } catch (err) {
        showToast("Error al generar o descargar el PDF.");
        console.error(err);
    } finally {
        elBtnPdf.classList.remove("btn-loading");
        elBtnPdf.disabled = false;
    }
}
