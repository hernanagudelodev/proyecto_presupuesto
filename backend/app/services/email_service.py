# backend/app/services/email_service.py
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from jinja2 import Environment, FileSystemLoader
from app.models.usuario import User

class EmailService:
    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("EMAILS_FROM")
        self.template_env = Environment(loader=FileSystemLoader("app/templates/email"))
        
        if not self.api_key or not self.from_email:
            raise ValueError("Las variables de entorno SENDGRID_API_KEY y EMAILS_FROM son necesarias.")
            
        self.sg_client = SendGridAPIClient(self.api_key)

    def _render_template(self, template_name: str, **kwargs) -> str:
        """Renderiza una plantilla de correo Jinja2."""
        template = self.template_env.get_template(template_name)
        return template.render(**kwargs)

    def send_email(self, to_email: str, subject: str, html_content: str):
        """
        Envía un correo electrónico usando la Web API de SendGrid.
        """
        message = Mail(
            from_email=self.from_email,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        try:
            response = self.sg_client.send(message)
            if 200 <= response.status_code < 300:
                print(f"✅ Correo para '{to_email}' aceptado por SendGrid (Estado: {response.status_code}).")
            else:
                print(f"❌ Error al enviar correo a '{to_email}'. SendGrid respondió con estado {response.status_code}.")
                print(f"   Respuesta: {response.body}")
        except Exception as e:
            print(f"❌ Excepción al intentar enviar correo a '{to_email}': {e}")

    def send_verification_email(self, user: User, token: str):
        """
        Envía el correo de verificación de cuenta.
        """
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        link = f"{frontend_url}/verify-email?token={token}"
        
        html_content = self._render_template(
            "verify.html",
            user=user,
            link=link
        )
        
        self.send_email(
            to_email=user.email,
            subject="Activa tu cuenta",
            html_content=html_content
        )

    def send_reset_password_email(self, user: User, token: str):
        """
        Envía el correo para restablecer la contraseña.
        """
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        link = f"{frontend_url}/auth/reset-password?token={token}"
        
        html_content = self._render_template(
            "reset.html",
            user=user,
            link=link
        )
        
        self.send_email(
            to_email=user.email,
            subject="Recupera tu contraseña",
            html_content=html_content
        )

# Creamos una única instancia del servicio para ser usada en toda la app
email_service = EmailService()