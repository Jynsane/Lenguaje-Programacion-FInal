import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

def entrenar_modelo():
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    csv_path = os.path.join(BASE_DIR, "dataset.csv")
    model_path = os.path.join(BASE_DIR, "modelo_diagnostico.joblib")
    cols_path = os.path.join(BASE_DIR, "columnas_sintomas.joblib")

    print(f"Cargando dataset desde {csv_path}...")
    df = pd.read_csv(csv_path, encoding="utf-8")
    
    # Separar características (X) y etiqueta (y)
    X = df.drop(columns=["enfermedad"])
    y = df["enfermedad"]
    
    # Dividir en entrenamiento y prueba
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Entrenando modelo de Bosques Aleatorios (Random Forest)...")
    # Usar Random Forest para obtener buenas estimaciones de probabilidad
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluar el modelo
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Precisión del modelo en test: {acc:.2%}")
    print("\nReporte de Clasificación:")
    print(classification_report(y_test, y_pred))
    
    # Guardar el modelo y la lista de columnas (síntomas)
    print(f"Guardando modelo entrenado en {model_path}...")
    joblib.dump(model, model_path)
    joblib.dump(list(X.columns), cols_path)
    print("Modelo guardado exitosamente.")

if __name__ == "__main__":
    entrenar_modelo()
