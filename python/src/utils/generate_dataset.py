import csv
import random
import os

# Definición de síntomas y enfermedades basadas en hechos.pl y reglas.pl
sintomas_lista = [
    "fiebre", "tos", "dolor_de_garganta", "congestion_nasal",
    "dolor_de_cabeza", "fatiga", "dolor_muscular", "escalofrios",
    "nauseas", "vomitos", "diarrea", "dolor_abdominal",
    "perdida_de_olfato", "perdida_de_gusto", "dificultad_para_respirar",
    "erupcion_cutanea", "dolor_de_pecho", "mareos",
    "sudoracion_nocturna", "perdida_de_peso",
    "dolor_de_oido", "disuria", "dolor_facial", "tos_con_esputo", "perdida_de_apetito"
]

enfermedades_reglas = {
    "gripe": ["fiebre", "dolor_muscular", "fatiga", "escalofrios"],
    "resfriado_comun": ["tos", "congestion_nasal", "dolor_de_garganta"],
    "covid19": ["fiebre", "perdida_de_olfato", "perdida_de_gusto", "fatiga"],
    "dengue": ["fiebre", "erupcion_cutanea", "dolor_muscular", "dolor_de_cabeza"],
    "gastroenteritis": ["nauseas", "vomitos", "diarrea", "dolor_abdominal"],
    "neumonia": ["fiebre", "dificultad_para_respirar", "dolor_de_pecho", "tos"],
    "amigdalitis": ["dolor_de_garganta", "fiebre", "dificultad_para_respirar"],
    "tuberculosis": ["tos", "sudoracion_nocturna", "perdida_de_peso", "fatiga"],
    "otitis": ["dolor_de_oido", "fiebre"],
    "bronquitis": ["tos", "dificultad_para_respirar", "fatiga"],
    "asma": ["dificultad_para_respirar", "tos"],
    "sinusitis": ["congestion_nasal", "dolor_facial", "dolor_de_cabeza"],
    "migrania": ["dolor_de_cabeza", "nauseas", "vomitos", "mareos"],
    "infeccion_urinaria": ["disuria", "fiebre"],
    "varicela": ["erupcion_cutanea", "fiebre", "perdida_de_apetito"]
}

def generar_dataset(filename=None, num_muestras_por_enfermedad=200):
    if filename is None:
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        filename = os.path.join(BASE_DIR, "dataset.csv")

    with open(filename, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        # Escribir cabecera: síntomas y la columna objetivo 'enfermedad'
        writer.writerow(sintomas_lista + ["enfermedad"])
        
        for enfermedad, sintomas_clave in enfermedades_reglas.items():
            for _ in range(num_muestras_por_enfermedad):
                row = []
                for s in sintomas_lista:
                    if s in sintomas_clave:
                        # Síntomas clave tienen alta probabilidad de estar (80%-100%)
                        row.append(1 if random.random() < 0.9 else 0)
                    else:
                        # Otros síntomas tienen baja probabilidad (ruido) (5%-15%)
                        row.append(1 if random.random() < 0.1 else 0)
                writer.writerow(row + [enfermedad])
                
        # Agregar algunos casos sanos o con síntomas aleatorios sin enfermedad clara
        for _ in range(300):
            row = []
            for s in sintomas_lista:
                row.append(1 if random.random() < 0.08 else 0)
            writer.writerow(row + ["ninguna"])

        # Generar casos explícitos con un solo síntoma (o combinaciones muy pobres)
        # para enseñar al modelo a clasificar como "ninguna" si no hay suficientes síntomas clave
        for s_idx, s in enumerate(sintomas_lista):
            for _ in range(15):
                row = [0] * len(sintomas_lista)
                row[s_idx] = 1  # Solo el síntoma actual
                # Agregar ruido mínimo de otros síntomas
                for i in range(len(sintomas_lista)):
                    if i != s_idx and random.random() < 0.03:
                        row[i] = 1
                writer.writerow(row + ["ninguna"])

    print(f"Dataset generado exitosamente en {filename}")

if __name__ == "__main__":
    generar_dataset()
