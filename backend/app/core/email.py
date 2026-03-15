import os
from aiosmtplib import send
from email.message import EmailMessage

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "DAgendaNG <noreply@dagendang.com>")

async def send_verification_email(email: str, token: str):
    """
    Sends a verification email to the user with a confirmation link.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print("WARNING: SMTP credentials not set. Verification email NOT sent.")
        print(f"Token for {email}: {token}")
        return

    message = EmailMessage()
    message["From"] = SMTP_FROM
    message["To"] = email
    message["Subject"] = "Verifica tu cuenta en DAgendaNG"
    
    # Updated link to the actual production/test domain
    frontend_url = os.getenv("FRONTEND_URL", "https://dagendang.com").rstrip("/")
    verification_link = f"{frontend_url}/verificar?token={token}"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #0d47a1;">¡Bienvenido a DAgendaNG!</h2>
        <p>Gracias por unirte a nuestro diario digital. Para completar tu registro y poder comentar en las noticias, por favor verifica tu cuenta haciendo clic en el siguiente botón:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{verification_link}" style="background-color: #0d47a1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verificar mi cuenta</a>
        </div>
        <p style="color: #757575; font-size: 12px;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
        <a href="{verification_link}">{verification_link}</a></p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
        <p style="font-size: 11px; color: #9e9e9e;">Este es un correo automático, por favor no respondas.</p>
    </div>
    """
    message.set_content(f"Hola, verifica tu cuenta en DAgendaNG usando este enlace: {verification_link}")
    message.add_alternative(html_content, subtype="html")

    try:
        await send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            use_tls=True if SMTP_PORT == 465 else False,
            start_tls=True if SMTP_PORT == 587 else False,
        )
        print(f"DEBUG EMAIL: Verification email sent to {email}")
    except Exception as e:
        print(f"ERROR EMAIL: Failed to send email to {email}: {str(e)}")
