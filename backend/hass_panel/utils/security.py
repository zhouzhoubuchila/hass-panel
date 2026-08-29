import os
import secrets
from pathlib import Path


SECRET_ENV = "HASS_PANEL_SECRET_KEY"
SECRET_FILE = ".jwt_secret"
MIN_SECRET_LENGTH = 32


def _validate_secret(value, source):
    secret = (value or "").strip()
    if len(secret) < MIN_SECRET_LENGTH:
        raise RuntimeError(f"{source} must contain at least {MIN_SECRET_LENGTH} characters")
    return secret


def load_or_create_secret(path):
    secret_path = Path(path)
    secret_path.parent.mkdir(parents=True, exist_ok=True)
    if secret_path.exists():
        return _validate_secret(secret_path.read_text(encoding="utf-8"), str(secret_path))

    generated = secrets.token_urlsafe(48)
    try:
        descriptor = os.open(secret_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(descriptor, "w", encoding="utf-8") as secret_file:
            secret_file.write(generated)
        if os.name != "nt":
            os.chmod(secret_path, 0o600)
    except FileExistsError:
        return _validate_secret(secret_path.read_text(encoding="utf-8"), str(secret_path))
    except OSError as error:
        raise RuntimeError(
            f"Unable to persist JWT secret at {secret_path}; set {SECRET_ENV} or make the config directory writable"
        ) from error
    return generated


def resolve_jwt_secret(config, environ=None):
    environment = os.environ if environ is None else environ
    configured = environment.get(SECRET_ENV, "")
    if configured.strip():
        return _validate_secret(configured, SECRET_ENV)

    user_config_dir = config.get("base", {}).get("user_config_dir")
    if not user_config_dir:
        raise RuntimeError("base.user_config_dir is required to persist the JWT secret")
    return load_or_create_secret(Path(user_config_dir).expanduser().resolve().parent / SECRET_FILE)
