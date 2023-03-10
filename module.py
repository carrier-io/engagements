#!/usr/bin/python3
# coding=utf-8

#   Copyright 2021 getcarrier.io
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

""" Module """
from pylon.core.tools import log  # pylint: disable=E0611,E0401
from pylon.core.tools import module  # pylint: disable=E0611,E0401
from tools import theme
from .init_db import init_db


class Module(module.ModuleModel):
    """ Task module """

    def __init__(self, context, descriptor):
        self.context = context
        self.descriptor = descriptor

    def init(self):
        """ Init module """
        log.info('Initializing module')
        init_db()

        self.descriptor.init_all()

        theme.register_subsection(
            "orch_tool",
            "engagements", "Engagements",
            title="Engagements",
            kind="slot",
            prefix="engagements_table_slot_",
            icon_class="fas fa-server fa-fw",
            # permissions=["orchestration_engineer"],
        )

        theme.register_page(
            "orch_tool",
            "engagements", "view",
            title="Engagement View",
            kind="slot",
            prefix="engagement_view_slot_",
            # permissions=["orchestration_engineer"],
        )

    def deinit(self):  # pylint: disable=R0201
        """ De-init module """
        log.info('De-initializing module')
