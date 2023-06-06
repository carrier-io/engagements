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

""" API """
from typing import Union, Dict
import flask  # pylint: disable=E0401
import flask_restful  # pylint: disable=E0401

# from pylon.core.tools import log  # pylint: disable=E0611,E0401

from tools import auth  # pylint: disable=E0401
from ...serializers.main import engagements_schema, engagement_schema, engagement_create_schema
from ...models.engagement import Engagement
from marshmallow.exceptions import ValidationError


class API(flask_restful.Resource):  # pylint: disable=R0903
    """ API Resource """

    url_params = [
        '<int:project_id>',
        '<int:project_id>/<string:hash_id>',
    ]

    def __init__(self, module):
        self.module = module
        self.rpc = module.context.rpc_manager.call


    def _return_response(self, 
            result: Dict[str, Union[str, Engagement]], *,
            is_list=False,
            no_body=False
        ):
        if result['ok']:
            field = 'items' if is_list else 'item'
            schema = engagements_schema if is_list else engagement_schema
            
            if result.get(field):
                result[field] = schema.dump(result[field])

            if no_body:
                return None, 204

            return result, 200

        if "not found" in result['error'].lower():
            return result, 404
        
        return result, 400
    

    @auth.decorators.check_api({
        "permissions": ["engagements.engagements.engagements.create"],
        "recommended_roles": {
            "administration": {"admin": True, "viewer": True, "editor": True},
            "default": {"admin": True, "viewer": True, "editor": True},
            "developer": {"admin": True, "viewer": True, "editor": True},
        }})
    def post(self, project_id):
        try:
            payload = engagement_create_schema.load(flask.request.json)
            payload['project_id'] = project_id
        except ValidationError as e:
            return {"ok": False, "error": str(e)}, 400

        # bussiness logic
        result = self.module.create_engagement(payload)
        
        # preparing response
        return self._return_response(result)



    @auth.decorators.check_api({
        "permissions": ["engagements.engagements.engagements.view"],
        "recommended_roles": {
            "administration": {"admin": True, "viewer": True, "editor": True},
            "default": {"admin": True, "viewer": True, "editor": True},
            "developer": {"admin": True, "viewer": True, "editor": True},
        }})
    def get(self, project_id):
        # bussiness logic
        result = self.module.list_engagements(project_id)
        
        # preparing response
        return self._return_response(result, is_list=True)
    

    @auth.decorators.check_api({
        "permissions": ["engagements.engagements.engagements.edit"],
        "recommended_roles": {
            "administration": {"admin": True, "viewer": True, "editor": True},
            "default": {"admin": True, "viewer": True, "editor": True},
            "developer": {"admin": True, "viewer": True, "editor": True},
    }})
    def put(self, project_id: int, hash_id: str):
        try:
            payload = engagement_schema.load(flask.request.json, partial=True)
        except ValidationError as e:
            return {"ok": False, "error": str(e)}, 400
        
        # bussiness logic
        result = self.module.update_engagement(project_id, hash_id, payload)

        #preparing response
        return self._return_response(result)


    @auth.decorators.check_api({
        "permissions": ["engagements.engagements.engagements.delete"],
        "recommended_roles": {
            "administration": {"admin": True, "viewer": True, "editor": True},
            "default": {"admin": True, "viewer": True, "editor": True},
            "developer": {"admin": True, "viewer": True, "editor": True},
    }})
    def delete(self, project_id: int, hash_id: str):
        # bussiness logic
        result = self.module.delete_engagement(project_id, hash_id)

        #preparing response
        return self._return_response(result, is_list=False, no_body=True)



        
        


