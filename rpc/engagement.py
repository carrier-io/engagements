#!/usr/bin/python3
# coding=utf-8

#   Copyright 2022 getcarrier.io
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

""" RPC """
# from pylon.core.tools import log  # pylint: disable=E0611,E0401
from pylon.core.tools import web  # pylint: disable=E0611,E0401
from tools import rpc_tools   # pylint: disable=E0401
from ..models.engagement import Engagement


class RPC:  # pylint: disable=E1101,R0903
    """ RPC Resource """
    @web.rpc("engagement_list_engagements", "list_engagements")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def list_engagements(self, project_id):
        engagements = Engagement.list(project_id)
        count = Engagement.count(project_id)
        return {"ok": True, 'items': engagements, 'total': count}


    @web.rpc("engagement_create_engagement", "create_engagement")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def create_engagement(self, data):
        ok, obj = Engagement.create(data)
        result = {"ok": ok}
        field = "item" if ok else "error"
        result[field] = obj
        return result


    @web.rpc("engagement_update_engagement", "update_engagement")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def update_engagement(self, project_id: int, hash_id: str, data: dict):
        ok, obj = Engagement.update(project_id, hash_id, data)
        result = {"ok": ok}
        field = "item" if ok else "error"
        result[field] = obj
        return result


    @web.rpc("engagement_delete_engagement", "delete_engagement")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def delete_engagement(self, project_id: int, hash_id: str):
        ok, obj = Engagement.remove(project_id, hash_id)
        result = {"ok": ok}
        if not ok:
            result['error'] = obj

        self.context.event_manager.fire_event(
            'issues_enagegement_deleted', {
                'engagement': hash_id
            }
        )
        return result


    @web.rpc("engagement_get_or_404", "get_engagement_or_404")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _get_or_404(self, id):
        return Engagement.query.get_or_404(id)


    @web.rpc("engagement_get_boards_hash_ids", 'get_boards_hash_ids')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _get_boards_hash_ids(self, hash_id):
        obj = Engagement.query.filter_by(hash_id=hash_id).first()
        return obj.kanban_boards if obj else []







