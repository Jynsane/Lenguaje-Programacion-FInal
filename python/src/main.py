from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import joblib
import numpy as np
import pandas as pd
import re
import io
import os
from difflib import get_close_matches, SequenceMatcher

# Importes para ReportLab (generación de PDF)
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

app = FastAPI(title="Microservicio de IA Médica", version="1.0.0")

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "features_count": len(sintomas_lista)
    }

# Cargar el modelo y las columnas al iniciar la aplicación de forma robusta
try:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(BASE_DIR, "modelo_diagnostico.joblib")
    cols_path = os.path.join(BASE_DIR, "columnas_sintomas.joblib")
    
    if not os.path.exists(model_path):
        model_path = "modelo_diagnostico.joblib"
        cols_path = "columnas_sintomas.joblib"
        
    model = joblib.load(model_path)
    sintomas_lista = joblib.load(cols_path)
    print(f"Modelo y columnas cargados exitosamente desde: {model_path}")
except Exception as e:
    print(f"Error al cargar el modelo: {e}")
    model = None
    sintomas_lista = []

# Diccionario expandido de sinónimos y palabras clave para NLP en español
sinonimos_sintomas = {
    "fiebre": ["fiebre", "calentura", "temperatura alta", "febril"],
    "tos": ["tos", "toser", "estornudo", "estornudar"],
    "dolor_de_garganta": ["garganta", "dolor de garganta", "irritacion de garganta", "garganta inflamada"],
    "congestion_nasal": ["congestion", "nariz tapada", "mocos", "congestion nasal", "romadizo"],
    "dolor_de_cabeza": ["cabeza", "dolor de cabeza", "jaqueca", "migraña", "cefalera", "cefalalgia"],
    "fatiga": ["fatiga", "cansancio", "cansado", "debilidad", "sin fuerzas", "agotado", "agotamiento"],
    "dolor_muscular": ["dolor muscular", "dolor de cuerpo", "cuerpo cortado", "musculos", "dolor en los huesos"],
    "escalofrios": ["escalofrios", "temblar de frio", "escalofrio"],
    "nauseas": ["nauseas", "ganas de vomitar", "asco", "nausea"],
    "vomitos": ["vomito", "vomitos", "vomitar"],
    "diarrea": ["diarrea", "soltura", "estomago flojo"],
    "dolor_abdominal": ["dolor de estomago", "dolor abdominal", "panza", "barriga", "retortijones", "vientre"],
    "perdida_de_olfato": ["olfato", "no huelo", "perdida de olfato", "anosmia", "perdi el olfato"],
    "perdida_de_gusto": ["gusto", "no siento sabor", "perdida de gusto", "ageusia", "perdi el gusto"],
    "dificultad_para_respirar": ["respirar", "falta de aire", "asfixia", "dificultad para respirar", "disnea", "agitacion"],
    "erupcion_cutanea": ["erupcion", "piel", "granitos", "ronchas", "erupcion cutanea", "sarpullido", "ronchitas"],
    "dolor_de_pecho": ["pecho", "dolor de pecho", "opresion en el pecho", "opresion de pecho"],
    "mareos": ["mareo", "mareos", "mareado"],
    "sudoracion_nocturna": ["sudor nocturno", "sudoracion nocturna", "sudar de noche", "sudores nocturnos"],
    "perdida_de_peso": ["perdi peso", "adelgazar", "perdida de peso", "baje de peso"],
    "dolor_de_oido": ["oido", "dolor de oido", "oreja", "otitis"],
    "disuria": ["dolor al orinar", "disuria", "ardor al orinar", "orina", "orinar con dolor"],
    "dolor_facial": ["cara", "dolor facial", "dolor en la cara", "frente inflamada"],
    "tos_con_esputo": ["flemas", "tos con flema", "esputo", "tos con esputo"],
    "perdida_de_apetito": ["hambre", "no quiero comer", "perdida de apetito", "sin hambre", "inapetencia"]
}

def limpiar_texto(texto: str) -> str:
    # Convertir a minúsculas y quitar acentos básicos
    texto = texto.lower()
    replacements = (
        ("á", "a"), ("é", "e"), ("í", "i"), ("ó", "o"), ("ú", "u"),
        ("ü", "u"), ("ñ", "n")
    )
    for a, b in replacements:
        texto = texto.replace(a, b)
    # Remover signos de puntuación comunes
    texto = re.sub(r'[^\w\s\s]', '', texto)
    return texto

# Modelos de entrada y salida
class TextRequest(BaseModel):
    texto: str

class SymptomListRequest(BaseModel):
    sintomas: List[str]

class PDFReportRequest(BaseModel):
    nombre: str
    edad: int
    sintomas: List[str]
    diagnosticos_prolog: List[str]
    diagnosticos_ml: List[Dict[str, Any]]
    es_urgente: bool

@app.post("/analizar-texto")
def analizar_texto(request: TextRequest):
    texto_limpio = limpiar_texto(request.texto)
    palabras_usuario = texto_limpio.split()
    sintomas_detectados = []
    
    # 1. Búsqueda exacta / por subcadena
    for sintoma_id, sinónimos in sinonimos_sintomas.items():
        coincide = False
        for sin in sinónimos:
            sin_limpio = limpiar_texto(sin)
            if re.search(r'\b' + re.escape(sin_limpio) + r'\b', texto_limpio):
                sintomas_detectados.append(sintoma_id)
                coincide = True
                break
        
        if coincide:
            continue
            
        # 2. Búsqueda difusa por similitud (tolerancia a errores ortográficos leves)
        for sin in sinónimos:
            sin_limpio = limpiar_texto(sin)
            sin_words = sin_limpio.split()
            n_words = len(sin_words)
            if n_words == 0:
                continue
                
            for i in range(len(palabras_usuario) - n_words + 1):
                chunk = " ".join(palabras_usuario[i:i+n_words])
                ratio = SequenceMatcher(None, sin_limpio, chunk).ratio()
                if ratio >= 0.82:  # Tolerancia del 18% para errores ortográficos o variaciones menores
                    sintomas_detectados.append(sintoma_id)
                    coincide = True
                    break
            if coincide:
                break
                
    return {"sintomas": sintomas_detectados}

@app.post("/predecir-ml")
def predecir_ml(request: SymptomListRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="El modelo de machine learning no está cargado.")
        
    sintomas = request.sintomas
    
    # Crear vector binario
    vector = []
    for s in sintomas_lista:
        vector.append(1 if s in sintomas else 0)
        
    # Convertir a DataFrame con nombres de características correctos para evitar UserWarning
    df_vector = pd.DataFrame([vector], columns=sintomas_lista)
    
    # Obtener probabilidades
    probabilidades = model.predict_proba(df_vector)[0]
    clases = model.classes_
    
    # Emparejar y ordenar de mayor a menor probabilidad
    resultados = []
    for clase, prob in zip(clases, probabilidades):
        if clase != "ninguna" and prob > 0.0:
            resultados.append({"enfermedad": clase, "probabilidad": round(float(prob) * 100, 2)})
            
    # Ordenar por probabilidad descendente
    resultados = sorted(resultados, key=lambda x: x["probabilidad"], reverse=True)
    
    # Retornar los top 3 diagnósticos
    return {"predicciones": resultados[:3]}

@app.post("/generar-pdf")
def generar_pdf(request: PDFReportRequest):
    buffer = io.BytesIO()
    
    # Configurar documento PDF
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # Estilos personalizados
    primary_color = colors.HexColor("#1A365D")   # Azul marino
    secondary_color = colors.HexColor("#0D9488") # Teal
    danger_color = colors.HexColor("#B91C1C")    # Rojo
    bg_light = colors.HexColor("#F8FAFC")        # Gris claro
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=primary_color,
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        textColor=colors.HexColor("#475569"),
        spaceAfter=25
    )
    
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=primary_color,
        spaceBefore=15,
        spaceAfter=8,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1E293B")
    )
    
    # Encabezado / Título
    story.append(Paragraph("REPORTE DE DIAGNÓSTICO MÉDICO", title_style))
    story.append(Paragraph("Generado por el Sistema Experto Neuro-Simbólico (Scala + Prolog + Python)", subtitle_style))
    story.append(Spacer(1, 10))
    
    # Datos del Paciente
    story.append(Paragraph("Datos del Paciente", h2_style))
    
    estado_urgente = "⚠️ CRÍTICO (Requiere atención inmediata)" if request.es_urgente else "✅ ESTABLE (Sin signos de urgencia)"
    
    datos_paciente = [
        [Paragraph("<b>Nombre:</b>", body_style), Paragraph(request.nombre, body_style)],
        [Paragraph("<b>Edad:</b>", body_style), Paragraph(f"{request.edad} años", body_style)],
        [Paragraph("<b>Estado de Urgencia:</b>", body_style), Paragraph(f"<font color='{danger_color if request.es_urgente else secondary_color}'><b>{estado_urgente}</b></font>", body_style)]
    ]
    
    t_paciente = Table(datos_paciente, colWidths=[2.0*inch, 5.0*inch])
    t_paciente.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_paciente)
    story.append(Spacer(1, 15))
    
    # Síntomas Reportados
    story.append(Paragraph("Síntomas Registrados", h2_style))
    sintomas_str = ", ".join([s.replace("_", " ").title() for s in request.sintomas])
    story.append(Paragraph(sintomas_str, body_style))
    story.append(Spacer(1, 15))
    
    # Tabla comparativa Neuro-Simbólica
    story.append(Paragraph("Resultados del Diagnóstico Neuro-Simbólico", h2_style))
    
    # Cabecera de la tabla
    tabla_diagnosticos = [
        [
            Paragraph("<b>Enfermedad Evaluada</b>", ParagraphStyle('HCol', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Motor Prolog (Reglas)</b>", ParagraphStyle('HCol', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Modelo Python (ML)</b>", ParagraphStyle('HCol', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Resultado / Consenso</b>", ParagraphStyle('HCol', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white))
        ]
    ]
    
    # Combinar predicciones y prolog
    todas_enfermedades = set(request.diagnosticos_prolog) | {x["enfermedad"] for x in request.diagnosticos_ml}
    
    for enf in todas_enfermedades:
        prolog_valido = "✓ Sí (Reglas cumplidas)" if enf in request.diagnosticos_prolog else "✗ No (Reglas no cumplidas)"
        
        # Buscar probabilidad
        ml_entry = next((x for x in request.diagnosticos_ml if x["enfermedad"] == enf), None)
        prob_str = f"{ml_entry['probabilidad']}%" if ml_entry else "0.0%"
        
        # Determinar el consenso
        if enf in request.diagnosticos_prolog and ml_entry and ml_entry["probabilidad"] >= 40.0:
            consenso = "<font color='red'><b>Alta Sospecha (Validado)</b></font>"
        elif enf in request.diagnosticos_prolog:
            consenso = "<font color='orange'><b>Posible (Regla Activa)</b></font>"
        else:
            consenso = "Solo sugerencia estadística"
            
        tabla_diagnosticos.append([
            Paragraph(enf.replace("_", " ").title(), body_style),
            Paragraph(prolog_valido, body_style),
            Paragraph(prob_str, body_style),
            Paragraph(consenso, body_style)
        ])
        
    t_diag = Table(tabla_diagnosticos, colWidths=[1.8*inch, 2.0*inch, 1.4*inch, 1.8*inch])
    t_diag.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('TOPPADDING', (0,0), (-1,0), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light]),
        ('PADDING', (0,1), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    story.append(t_diag)
    story.append(Spacer(1, 20))
    
    # Justificación y Explicabilidad
    story.append(Paragraph("Explicabilidad Médica del Sistema", h2_style))
    justificacion_txt = """
    Este reporte combina un modelo predictivo de Machine Learning (Random Forest) que analiza el espectro de síntomas y calcula 
    probabilidades estadísticas basadas en un historial histórico, junto con un motor de lógica determinista en Prolog que evalúa
    la verdad o falsedad clínica del conjunto de síntomas.
    <br/><br/>
    Si una enfermedad muestra 'Alta Sospecha (Validado)', significa que cumple con el criterio clínico estricto programado en Prolog
    y que la inteligencia artificial estadística también la detecta con un alto nivel de confianza.
    """
    story.append(Paragraph(justificacion_txt, body_style))
    story.append(Spacer(1, 30))
    
    # Descargo de Responsabilidad (Disclaimer)
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-BoldOblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#7F1D1D")
    )
    story.append(Paragraph("<b>ADVERTENCIA DE USO ACADÉMICO:</b> Este reporte es generado de manera automática por un prototipo de laboratorio de software. NO constituye un diagnóstico médico profesional de carácter clínico. Por favor consulte a un médico colegiado o acuda a un centro de salud ante cualquier síntoma clínico.", disclaimer_style))
    
    # Construir PDF
    doc.build(story)
    
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=reporte_diagnostico.pdf"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8081)
