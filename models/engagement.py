from datetime import datetime
from uuid import uuid4, UUID
import sqlalchemy.types as types
from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound
from sqlalchemy import (
    String, 
    Column, 
    Integer,
    ARRAY, 
    Boolean, 
    Text,
    Date,
)
# from pylon.core.tools import log
from tools import db_tools, db, rpc_tools, api_tools


class ChoiceType(types.TypeDecorator):

    impl = types.String
    cache_ok = False

    def __init__(self, choices: dict, **kwargs):
        self.choices = dict(choices)
        super().__init__(**kwargs)

    def process_bind_param(self, value: str, dialect):
        return self.choices[value.lower()]

    def process_result_value(self, value: str, dialect):
        try:
            return self.choices[value.lower()]
        except KeyError:
            return [k for k, v in self.choices.items() if v.lower() == value.lower()][0]


class Engagement(db_tools.AbstractBaseMixin, db.Base):
    __tablename__ = "engagement_engagements"

    STATUS_CHOICES = {
        'new':'new',
        'in_progress':'in_progress',
        'done':'done'
    }
    id = Column(Integer, primary_key=True)
    hash_id = Column(String(64), unique=True, nullable=False)
    project_id = Column(Integer, nullable=False)
    name = Column(String(128), nullable=False)
    goal = Column(Text)
    status = Column(ChoiceType(STATUS_CHOICES), nullable=False, default='new')
    start_date = Column(Date, default=datetime.utcnow)
    end_date = Column(Date)
    active = Column(Boolean, default=True)
    kanban_boards = Column(ARRAY(String(64)), default=[])

    @staticmethod
    def list(project_id):
        return Engagement.query.filter_by(project_id=project_id).all()

    @staticmethod
    def count(project_id):
        return Engagement.query.filter_by(project_id=project_id).count()

    @staticmethod
    def create(data:dict):
        data['hash_id'] = str(uuid4())
        engagement = Engagement(**data)
        try:
            engagement.insert()
        except Exception as e:
            return False, str(e)
        return True, engagement

    @staticmethod
    def get(project_id: int, hash_id: UUID):
        try:
            condition = {'project_id': project_id, 'hash_id': hash_id}
            engagement = Engagement.query.filter_by(**condition).one()
        except MultipleResultsFound:
            return False, 'Multiple results found'
        except NoResultFound:
            return False, 'Not Found'
        except Exception as e:
            return False, str(e)
        return True, engagement

    @staticmethod
    def update(project_id: int, hash_id: UUID, data: dict):
        ok, obj = Engagement.get(project_id, hash_id)

        if not ok:
            return ok, obj

        # updating object
        for field, value in data.items():
            if hasattr(obj, field):
                setattr(obj, field, value)

        try:
            Engagement.commit()
        except Exception as e:
            obj.rollback()
            return False, str(e)

        return True, obj

    @staticmethod
    def remove(project_id: int, hash_id: str):
        ok, obj = Engagement.get(project_id, hash_id)
        if not ok:
            return ok, obj
        obj.delete()
        return True, None