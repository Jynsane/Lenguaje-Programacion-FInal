% ============================================================
%  SISTEMA EXPERTO: DIAGNÓSTICO DE ENFERMEDADES
%  Archivo: reglas.pl
%  Descripción: Reglas de inferencia para diagnóstico
% ============================================================

:- [hechos].

% --- Reglas por enfermedad ---

% GRIPE: fiebre alta + dolor muscular + fatiga + escalofrios
diagnosticar(gripe, Sintomas) :-
    member(fiebre,          Sintomas),
    member(dolor_muscular,  Sintomas),
    member(fatiga,          Sintomas),
    member(escalofrios,     Sintomas).

% RESFRIADO COMÚN: tos + congestion_nasal + dolor_de_garganta (sin fiebre fuerte)
diagnosticar(resfriado_comun, Sintomas) :-
    member(tos,               Sintomas),
    member(congestion_nasal,  Sintomas),
    member(dolor_de_garganta, Sintomas).

% COVID-19: fiebre + perdida_de_olfato + perdida_de_gusto + fatiga
diagnosticar(covid19, Sintomas) :-
    member(fiebre,            Sintomas),
    member(perdida_de_olfato, Sintomas),
    member(perdida_de_gusto,  Sintomas),
    member(fatiga,            Sintomas).

% COVID-19 variante grave: dificultad_para_respirar + fiebre + dolor_de_pecho
diagnosticar(covid19, Sintomas) :-
    member(dificultad_para_respirar, Sintomas),
    member(fiebre,                   Sintomas),
    member(dolor_de_pecho,           Sintomas).

% DENGUE: fiebre + erupcion_cutanea + dolor_muscular + dolor_de_cabeza
diagnosticar(dengue, Sintomas) :-
    member(fiebre,           Sintomas),
    member(erupcion_cutanea, Sintomas),
    member(dolor_muscular,   Sintomas),
    member(dolor_de_cabeza,  Sintomas).

% GASTROENTERITIS: nauseas + vomitos + diarrea + dolor_abdominal
diagnosticar(gastroenteritis, Sintomas) :-
    member(nauseas,          Sintomas),
    member(vomitos,          Sintomas),
    member(diarrea,          Sintomas),
    member(dolor_abdominal,  Sintomas).

% NEUMONÍA: fiebre + dificultad_para_respirar + dolor_de_pecho + tos
diagnosticar(neumonia, Sintomas) :-
    member(fiebre,                   Sintomas),
    member(dificultad_para_respirar, Sintomas),
    member(dolor_de_pecho,           Sintomas),
    member(tos,                      Sintomas).

% AMIGDALITIS: dolor_de_garganta + fiebre + dificultad_para_respirar
diagnosticar(amigdalitis, Sintomas) :-
    member(dolor_de_garganta,        Sintomas),
    member(fiebre,                   Sintomas),
    member(dificultad_para_respirar, Sintomas).

% TUBERCULOSIS: tos + sudoracion_nocturna + perdida_de_peso + fatiga
diagnosticar(tuberculosis, Sintomas) :-
    member(tos,                Sintomas),
    member(sudoracion_nocturna,Sintomas),
    member(perdida_de_peso,    Sintomas),
    member(fatiga,             Sintomas).

% OTITIS: dolor de oído + fiebre
diagnosticar(otitis, Sintomas) :-
    member(dolor_de_oido, Sintomas),
    member(fiebre,        Sintomas).

% BRONQUITIS: tos + dificultad para respirar + fatiga
diagnosticar(bronquitis, Sintomas) :-
    member(tos,                      Sintomas),
    member(dificultad_para_respirar,Sintomas),
    member(fatiga,                   Sintomas).

% ASMA: dificultad para respirar + tos
diagnosticar(asma, Sintomas) :-
    member(dificultad_para_respirar, Sintomas),
    member(tos,                      Sintomas).

% SINUSITIS: congestion nasal + dolor facial + dolor de cabeza
diagnosticar(sinusitis, Sintomas) :-
    member(congestion_nasal, Sintomas),
    member(dolor_facial,     Sintomas),
    member(dolor_de_cabeza,  Sintomas).

% MIGRAÑA: dolor de cabeza + náuseas + vómitos + mareos
diagnosticar(migrania, Sintomas) :-
    member(dolor_de_cabeza, Sintomas),
    member(nauseas,         Sintomas),
    member(vomitos,         Sintomas),
    member(mareos,          Sintomas).

% INFECCIÓN URINARIA: disuria + fiebre
diagnosticar(infeccion_urinaria, Sintomas) :-
    member(disuria, Sintomas),
    member(fiebre,  Sintomas).

% VARICELA: erupción cutánea + fiebre + pérdida de apetito
diagnosticar(varicela, Sintomas) :-
    member(erupcion_cutanea,   Sintomas),
    member(fiebre,             Sintomas),
    member(perdida_de_apetito, Sintomas).

% --- Regla general: obtener TODOS los diagnósticos posibles ---
% Uso: obtener_diagnosticos([fiebre, tos, fatiga], Lista).
obtener_diagnosticos(Sintomas, Diagnosticos) :-
    findall(E, diagnosticar(E, Sintomas), Diagnosticos).

% --- Regla: verificar si un síntoma es válido ---
sintoma_valido(S) :- sintoma(S).

% --- Regla: nivel de urgencia ---
urgente(Sintomas) :-
    member(dificultad_para_respirar, Sintomas).
urgente(Sintomas) :-
    member(dolor_de_pecho, Sintomas).
