% ============================================================
%  SISTEMA EXPERTO: DIAGNÓSTICO DE ENFERMEDADES
%  Archivo: hechos.pl
%  Descripción: Base de hechos — síntomas y enfermedades
% ============================================================

% --- Síntomas posibles ---
sintoma(fiebre).
sintoma(tos).
sintoma(dolor_de_garganta).
sintoma(congestion_nasal).
sintoma(dolor_de_cabeza).
sintoma(fatiga).
sintoma(dolor_muscular).
sintoma(escalofrios).
sintoma(nauseas).
sintoma(vomitos).
sintoma(diarrea).
sintoma(dolor_abdominal).
sintoma(perdida_de_olfato).
sintoma(perdida_de_gusto).
sintoma(dificultad_para_respirar).
sintoma(erupcion_cutanea).
sintoma(dolor_de_pecho).
sintoma(mareos).
sintoma(sudoracion_nocturna).
sintoma(perdida_de_peso).

% --- Síntomas adicionales añadidos ---
sintoma(dolor_de_oido).
sintoma(disuria).
sintoma(dolor_facial).
sintoma(tos_con_esputo).
sintoma(perdida_de_apetito).

% --- Enfermedades registradas ---
enfermedad(gripe).
enfermedad(resfriado_comun).
enfermedad(covid19).
enfermedad(dengue).
enfermedad(gastroenteritis).
enfermedad(neumonia).
enfermedad(amigdalitis).
enfermedad(tuberculosis).
enfermedad(otitis).
enfermedad(bronquitis).
enfermedad(asma).
enfermedad(sinusitis).
enfermedad(migrania).
enfermedad(infeccion_urinaria).
enfermedad(varicela).
