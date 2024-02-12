from tools import db


def init_db():
    from .models.attachments import Attachment
    from .models.engagement import Engagement
    db.get_shared_metadata().create_all(bind=db.engine)

