from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base

# Modelo para reglas recurrentes de ingresos y gastos

class ReglaRecurrente(Base):
    __tablename__ = "reglas_recurrentes"

    id = Column(Integer, primary_key=True, index=True)

    # Datos de la plantilla
    descripcion = Column(String, nullable=False)
    valor_predeterminado = Column(Float, nullable=False)
    tipo = Column(String, nullable=False)  # "Ingreso" o "Gasto"

    # Datos para la regla de recurrencia
    frecuencia = Column(String, nullable=False) # ej: "mensual", "semanal", "anual"
    dia = Column(Integer, nullable=True) # ej: 15 (para el día del mes), o 5 (para 'viernes' si es semanal)

    # Permite desactivar la regla sin eliminarla, y asi evitar que genere nuevas transacciones.
    # Estará activa por defecto y no puede ser nula.
    is_active = Column(Boolean, nullable=False, default=True)
    
    # Guardará el número del mes (1-12) para las reglas anuales
    mes = Column(Integer, nullable=True)

    # Relaciones opcionales (el usuario las definirá al generar las transacciones)
    categoria_predeterminada_id = Column(Integer, ForeignKey("categorias.id"), nullable=True)

    # Relación con el usuario
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    usuario = relationship("User")
    categoria_predeterminada = relationship("Categoria")