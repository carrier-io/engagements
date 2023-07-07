from marshmallow import fields
from tools import ma
from ..models.attachments import Attachment


class AttachmentSchema(ma.SQLAlchemyAutoSchema):
    file_name = fields.String(allow_none=True)

    class Meta:
        model = Attachment
        fields = (
            'id',
            'engagement_id',
            'file_name',
            'url',
            'thumbnail_url',
            'created_at',
            'project_id',
        )
        dump_only = (
            'id',
            'url',
            'updated_at',
            'created_at',
            'project_id',
        )


attachment_schema = AttachmentSchema()
attachments_schema = AttachmentSchema(many=True)
