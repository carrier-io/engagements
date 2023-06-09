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


engagement_schema = EngagementDetailSchema()
engagement_create_schema = EngagementSchema()
engagements_schema = EngagementSchema(many=True)
