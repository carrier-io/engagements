from tools import auth
from pylon.core.tools import log


def get_log_description(title, changes):
    description = title + "\n\n"
    description += "Changes:\n"
    for field, values in changes.items():
        if not type(values) == dict:
            continue
        description += f"{field}: {values['old_value']} -> {values['new_value']}"
    return description    


def fire_log(
        event_manager,
        project_id, 
        auditable_id, 
        auditable_type,
        user_email, 
        action, 
        description,
        related_entities=[],
        changes=None,
    ):
    
    event_manager.fire_event(
        'audit_add_log', 
        {
            'project_id': project_id,
            'auditable_id': auditable_id,
            'auditable_type': auditable_type,
            'user_email': user_email,
            'related_entities': related_entities,
            'action': action,
            'description': description,
            'changes': changes,
        }
    )


def fire_engagement_log(event_manager, project_id, engagement_id, user_email, action, description, changes=None):
    fire_log(
        event_manager,
        project_id,
        engagement_id,
        "Engagement",
        user_email,
        action,
        description,
        changes=changes,
    )


def log_delete_engagement(event_manager, project_id, engagement_id):
    user = auth.current_user()
    params = {
        'event_manager': event_manager,
        'project_id': project_id,
        'engagement_id': engagement_id,
        'user_email': user['email'],
        'description': f"{user['email']} deleted engagement with id {engagement_id}",
        'action': 'delete',
    }
    fire_engagement_log(**params)


def log_create_engagement(event_manager, project_id, engagement_id, user=None):
    if not user:
        user = auth.current_user()
    params = {
        'event_manager': event_manager,
        'project_id': project_id,
        'engagement_id': engagement_id,
        'user_email': user['email'],
        'description': f"{user['email']} created engagement with id {engagement_id}",
        'action': 'create',
    }
    fire_engagement_log(**params)


def log_update_engagement(event_manager, project_id, engagement_id, changes: dict, user=None):
    if not user:
        user = auth.current_user()
    message = f"{user['email']} updated engagement with id {engagement_id}"
    # description
    description = get_log_description(message, changes)

    params = {
        'event_manager': event_manager,
        'project_id': project_id,
        'engagement_id': engagement_id,
        'user_email': user['email'],
        'description': description,
        'action': 'update',
        'changes': changes,
    }
    fire_engagement_log(**params)


def log_attachment_update(event_manager, project_id, engagement_id, auditable_id, changes: dict):
    user = auth.current_user()
    message = f"{user['email']} updated attachment {auditable_id} of engagement with id {engagement_id}"

    # description
    description = get_log_description(message, changes)

    params = {
        'event_manager': event_manager,
        'project_id': project_id,
        'auditable_id': auditable_id,
        'auditable_type': "Attachment",
        'user_email': user['email'],
        'description': description,
        'action': 'update',
        'changes': changes,
        'related_entities': [
            {
                'auditable_id': engagement_id,
                'auditable_type': "Engagement",
            }
        ],
    }
    fire_log(**params)


def log_attachment_create(event_manager, project_id, engagement_id, auditable_id):
    user = auth.current_user()
    params = {
        'event_manager': event_manager,
        'project_id':project_id,
        'auditable_id': auditable_id,
        'auditable_type': "Attachment",
        'user_email': user['email'],
        'description': f"{user['email']} created attachment {auditable_id} for engagement with id {engagement_id}",
        'action': 'create',
        'related_entities': [
            {
                'auditable_id': engagement_id,
                'auditable_type': "Engagement",
            }
        ],
    }
    fire_log(**params)


def log_attachment_delete(event_manager,project_id, engagement_id, auditable_id):
    user = auth.current_user()
    params = {
        'event_manager': event_manager,
        'project_id':project_id,
        'auditable_id': auditable_id,
        'auditable_type': "Attachment",
        'user_email': user['email'],
        'description': f"{user['email']} deleted attachment {auditable_id} from engagement with id {engagement_id}",
        'action': 'delete',
        'related_entities': [
            {
                'auditable_id': engagement_id,
                'auditable_type': "Engagement",
            }
        ],
    }
    fire_log(**params)


def log_comment_delete(event_manager,project_id, engagement_id, auditable_id):
    user = auth.current_user()
    message = f"{user['email']} deleted comment {auditable_id} from engagement with id {engagement_id}"
    params = {
        'event_manager': event_manager,
        'project_id':project_id,
        'auditable_id': auditable_id,
        'auditable_type': "Comment",
        'user_email': user['email'],
        'description': message,
        'action': 'delete',
        'related_entities': [
            {
                'auditable_id': engagement_id,
                'auditable_type': "Engagement",
            }
        ],
    }
    fire_log(**params)


def log_comment_create(event_manager,project_id, engagement_id, auditable_id):
    user = auth.current_user()
    message = f"{user['email']} created comment {auditable_id} for engagement with id {engagement_id}",
    params = {
        'event_manager': event_manager,
        'project_id':project_id,
        'auditable_id': auditable_id,
        'auditable_type': "Comment",
        'user_email': user['email'],
        'description': message,
        'action': 'create',
        'related_entities': [
            {
                'auditable_id': engagement_id,
                'auditable_type': "Engagement",
            }
        ],
    }
    fire_log(**params)


def log_comment_update(event_manager, project_id, engagement_id, auditable_id, changes: dict, title=None):
    user = auth.current_user()
    message = f"{user['email']} updated comment {auditable_id} of engagement with id {engagement_id}"
    # title
    title = title if title else message

    # description
    description = get_log_description(title, changes)

    params = {
        'event_manager': event_manager,
        'project_id': project_id,
        'auditable_id': auditable_id,
        'auditable_type': "Comment",
        'user_email': user['email'],
        'description': description,
        'action': 'update',
        'changes': changes,
        'related_entities': [
            {
                'auditable_id': engagement_id,
                'auditable_type': "Engagement",
            }
        ],
    }
    fire_log(**params)


def log_tag_create(event_manager, project_id, engagement_id, auditable_id):
    user = auth.current_user()
    message = f"{user['email']} created tag {auditable_id} for engagement with id {engagement_id}",
    params = {
        'event_manager': event_manager,
        'project_id':project_id,
        'auditable_id': auditable_id,
        'auditable_type': "Tag",
        'user_email': user['email'],
        'description': message,
        'action': 'create',
        'related_entities': [
            {
                'auditable_id': engagement_id,
                'auditable_type': "Engagement",
            }
        ],
    }
    fire_log(**params)
