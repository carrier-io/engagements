from ..models.engagement import Engagement
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields


class EngagementSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Engagement
        dump_only = (
            'project_id',
            'hash_id',
        )


class EngagementDetailSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Engagement


event_schema = EngagementDetailSchema()
event_create_schema = EngagementSchema()
events_schema = EngagementSchema(many=True)
