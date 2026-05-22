import logging
import sys
from .config import get_settings

settings = get_settings()


def setup_logging() -> None:
    level = logging.DEBUG if not settings.is_production else logging.INFO
    fmt = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"

    logging.basicConfig(
        level=level,
        format=fmt,
        handlers=[logging.StreamHandler(sys.stdout)],
    )
    # Silenciar logs ruidosos de SQLAlchemy en producción
    if settings.is_production:
        logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


logger = logging.getLogger("juanma_api")
