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

from pylon.core.tools import log  # pylint: disable=E0611,E0401

from tools import auth  # pylint: disable=E0401
from ...serializers.main import events_schema, event_schema, event_create_schema
from ...models.engagement import Engagement
from marshmallow.exceptions import ValidationError


class API(flask_restful.Resource):  # pylint: disable=R0903
    """ API Resource """

    url_params = [
        '<string:engagement_id>',
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
            schema = events_schema if is_list else event_schema
            
            if result.get(field):
                result[field] = schema.dump(result[field])

            if no_body:
                return None, 204

            return result, 200
        
        return result, 404


    @auth.decorators.check_api(["orchestration_engineer"])
    def post(self, engagement_id):
        payload = flask.request.json
        issue_ids = payload['issue_ids']

        # bussiness logic
        result = self.rpc.issues_set_engagements(issue_ids, engagement_id)
        
        # preparing response
        return self._return_response(result)
    

    @auth.decorators.check_api(["orchestration_engineer"])
    def get(self, engagement_id):
        # bussiness logic
        query = {"engagement": engagement_id}
        result = self.rpc.issues_filter_issues(query)
        
        # preparing response
        return self._return_response(result)
    


        
        


