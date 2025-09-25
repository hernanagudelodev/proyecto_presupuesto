import os
from fastapi_mail import ConnectionConfig, FastMail
from jinja2 import Environment, FileSystemLoader

# Leemos el puerto desde las variables de entorno
port = int(os.getenv("SMTP_PORT", 587))

# --- LÓGICA FINAL Y ROBUSTA ---
# El puerto 465 es el único que usa SSL/TLS directo.
# Los demás (587, 2525, etc.) usan STARTTLS.
use_ssl = port == 465

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("SMTP_USER"),
    MAIL_PASSWORD=os.getenv("SMTP_PASSWORD"),
    MAIL_FROM=os.getenv("EMAILS_FROM"),
    MAIL_PORT=port,
    MAIL_SERVER=os.getenv("SMTP_HOST"),
    MAIL_STARTTLS=not use_ssl,  # Se activa para cualquier puerto que NO SEA 465
    MAIL_SSL_TLS=use_ssl,       # Se activa solo si el puerto es 465
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER="app/templates/email"
)

fm  = FastMail(conf)
env = Environment(loader=FileSystemLoader(conf.TEMPLATE_FOLDER))
