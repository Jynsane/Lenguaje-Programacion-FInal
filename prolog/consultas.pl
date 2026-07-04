% ============================================================
%  SISTEMA EXPERTO: DIAGNÓSTICO DE ENFERMEDADES
%  Archivo: consultas.pl
%  Descripción: Consultas de prueba para el sistema experto
% ============================================================

:- [reglas].

% ============================================================
%  CONSULTAS DE PRUEBA — ejecutar con: swipl -s consultas.pl
% ============================================================

%  1. Caso de Gripe
%     ?- diagnosticar(X, [fiebre, dolor_muscular, fatiga, escalofrios]).
%     X = gripe.

%  2. Caso de COVID-19
%     ?- diagnosticar(X, [fiebre, perdida_de_olfato, perdida_de_gusto, fatiga]).
%     X = covid19.

%  3. Caso de Dengue
%     ?- diagnosticar(X, [fiebre, erupcion_cutanea, dolor_muscular, dolor_de_cabeza]).
%     X = dengue.

%  4. Múltiples diagnósticos posibles
%     ?- obtener_diagnosticos([fiebre, tos, fatiga, dolor_muscular, escalofrios], D).

%  5. Verificar urgencia
%     ?- urgente([fiebre, dificultad_para_respirar, tos]).
%     true.

% --- Predicado de demostración automática ---
demo :-
    nl,
    write('=== DEMOSTRACIÓN DEL SISTEMA EXPERTO ==='), nl, nl,

    write('Caso 1 — Síntomas: fiebre, dolor_muscular, fatiga, escalofrios'), nl,
    ( diagnosticar(E1, [fiebre, dolor_muscular, fatiga, escalofrios])
    -> format('  Diagnóstico: ~w~n', [E1])
    ;  write('  Sin diagnóstico') ),
    nl,

    write('Caso 2 — Síntomas: fiebre, perdida_de_olfato, perdida_de_gusto, fatiga'), nl,
    ( diagnosticar(E2, [fiebre, perdida_de_olfato, perdida_de_gusto, fatiga])
    -> format('  Diagnóstico: ~w~n', [E2])
    ;  write('  Sin diagnóstico') ),
    nl,

    write('Caso 3 — Síntomas: nauseas, vomitos, diarrea, dolor_abdominal'), nl,
    ( diagnosticar(E3, [nauseas, vomitos, diarrea, dolor_abdominal])
    -> format('  Diagnóstico: ~w~n', [E3])
    ;  write('  Sin diagnóstico') ),
    nl,

    write('Caso 4 — Lista completa de diagnósticos posibles con múltiples síntomas'), nl,
    obtener_diagnosticos(
        [fiebre, tos, fatiga, escalofrios, dolor_muscular, dificultad_para_respirar, dolor_de_pecho],
        Todos
    ),
    format('  Diagnósticos: ~w~n', [Todos]),
    nl,

    write('=== FIN DE LA DEMOSTRACIÓN ==='), nl.

:- initialization(demo, main).
