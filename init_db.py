from tools import db


def init_db():
    from plugins.engagements import models
    db.Base.metadata.create_all(bind=db.engine)

