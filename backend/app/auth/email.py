import os
from fastapi_mail import ConnectionConfig, FastMail
from jinja2 import Environment, FileSystemLoader

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("SMTP_USER"),       # tu cuenta SMTP (e.g., Gmail App Password)
    MAIL_PASSWORD=os.getenv("SMTP_PASSWORD"),   # App Password de Gmail
    MAIL_FROM=os.getenv("EMAILS_FROM"),        # dirección remitente
    MAIL_PORT=int(os.getenv("SMTP_PORT", 587)),# 587 para STARTTLS
    MAIL_SERVER=os.getenv("SMTP_HOST"),        # smtp.gmail.com para Gmail
    MAIL_STARTTLS=True,                        # habilita STARTTLS
    MAIL_SSL_TLS=False,                        # deshabilita SSL directo
    USE_CREDENTIALS=True,                      # usa credenciales de login
    VALIDATE_CERTS=True,                       # valida el certificado TLS
    TEMPLATE_FOLDER="app/templates/email"      # carpeta con tus plantillas Jinja2
)
fm  = FastMail(conf)
env = Environment(loader=FileSystemLoader(conf.TEMPLATE_FOLDER))


