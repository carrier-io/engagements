function convertDatetime(datetimeStr) {
    return new Date(datetimeStr + 'Z').toLocaleString();
}

function compareObjects(previousArray, currentArray) {
    const addedObjects = [];
    const updatedObjects = [];
    const deletedObjects = [];
  
    // Compare previous array with current array
    previousArray.forEach((previousObj) => {
      const matchingObj = currentArray.find((currentObj) => currentObj.id === previousObj.id);
      if (matchingObj) {
        // Object exists in both arrays, check for updates
        if (JSON.stringify(matchingObj) !== JSON.stringify(previousObj)) {
          updatedObjects.push({ previousObj, matchingObj }); // Store both old and new values
        }
      } else {
        // Object doesn't exist in current array, consider it as deleted
        deletedObjects.push(previousObj);
      }
    });
  
    // Find newly added objects
    currentArray.forEach((currentObj) => {
      const matchingObj = previousArray.find((previousObj) => previousObj.id === currentObj.id);
      if (!matchingObj) {
        addedObjects.push(currentObj);
      }
    });
  
    return {
      added: addedObjects,
      updated: updatedObjects,
      deleted: deletedObjects,
    };
}

function generateDescription(result) {
    let description = '';
  
    if (result.added.length > 0) {
        field = result.added[0]['field']
        value = result.added[0]['value']
        description = `New field <b>${field}</b> was added with value <b>${value}</b>`
        return description;
    }
  
    if (result.updated.length > 0) {
        field = result.updated[0]['matchingObj']['field']
        newValue = result.updated[0]['matchingObj']['value']
        oldValue = result.updated[0]['previousObj']['value']
        description += `Field ${field} updated from <b>${oldValue}</b> to <b>${newValue}<b/>`;
        return description;
    }
  
    if (result.deleted.length > 0) {
        field = result.deleted[0]['field']
        description = `Field <b>${field}</b> was removed`
        return description;
    }
  
    return description;
}

descriptionFormatter = {
    escapeHtml(text) {
        if (text == null){
            return 'null'
        }
        var map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        };
        text = String(text);
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    },

    getUpdateDesc(log){
        if (log['changes']==null || Object.keys(log['changes']).length==0){
            return ''
        }

        result = `Changes:<br/>`
        for (key in log['changes']){
            value = log['changes'][key]
            if (key == 'custom_fields'){
                result = compareObjects(value['old_value'], value['new_value'])
                result = generateDescription(result)
            } else {
                oldValue = descriptionFormatter.escapeHtml(value['old_value'])
                newValue = descriptionFormatter.escapeHtml(value['new_value'])
                result += `<b>${key}</b>: from <b>${oldValue}</b> to  <b>${newValue}</b><br>`
            }
        }
        return result
    },

    format(value, row){
        extraDesc = ''
        if(row['action'] == 'update'){
            extraDesc = descriptionFormatter.getUpdateDesc(row)
        }

        if (row['auditable_type']=="Engagement"){
            return `This engagement was ${row['action']}d<br/>` + extraDesc;
        }
        title = `${row['auditable_type']} with id ${row['auditable_id']} was ${row['action']}d in this engagement<br/>`
        return title + extraDesc;
    }
}

const HistoryLogs = {
    props: ['engagement'],
    watch:{
        engagement: {
            handler(value, oldValue){
                if(value['id'] != oldValue['id']){
                    $('#activity-logs').bootstrapTable('refresh', {
                        url: this.url,
                    });
                    this.toggeTable = false;
                }
            }
        }   
    },
    data(){
        return {
            toggeTable: false,
        }
    },
    methods:{
        isRelavantLog(log){
            id = this.engagement.id
            return (
                (log['auditable_type']=="Engagement"&& log['auditable_id']==id) ||
                log.related_entities.some(entity => {
                    return entity['auditable_type'] == "Engagement" && entity['auditable_id'] == id
                })
            )
        }
    },
    computed:{
        url(){
            related_fields = JSON.stringify({
                'auditable_type': "Engagement",
                "auditable_id": this.engagement.id 
            })
            return `${logs_url}?auditable_type=Engagement&auditable_id=${this.engagement.id}&related_entities=${related_fields}`   
        },
        iconClass(){
            return !this.toggeTable ? "icon-arrow-down__16" : "icon-arrow-up__16"
        }
    },
    mounted() {
        $('#activity-logs').bootstrapTable({
            url: this.url
        });
        socket.on('new_log_added', data => {
            if (this.isRelavantLog(data)){
                $('#activity-logs').bootstrapTable('append', data)
            }
        })
    },
    template: `
        <div class="card mt-3 mr-3 card-table-sm w-100">
            <div class="row px-4 pt-4">
                <div class="col-4">
                    <h4>History Logs</h4>
                </div>
                <div class="col-8">
                    <div class="d-flex justify-content-end">
                        <div class="custom-input custom-input_search__sm mr-2 position-relative">
                            <input
                                id="customSearchBar"
                                type="text"
                                placeholder="Search">
                                <img src="/issues/static/ico/search.svg" class="icon-search position-absolute">
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <table class="table table-borderless"
                    id="activity-logs"
                    data-toggle="table"
                    data-unique-id="id"
                    data-side-pagination="server"
                    data-search="true"
                    data-search-selector="#customSearchBar"
                    data-pagination="true"
                    data-page-list="[10, 25, 50, 100, all]"

                    data-pagination-pre-text="<img src='/design-system/static/assets/ico/arrow_left.svg'>"
                    data-pagination-next-text="<img src='/design-system/static/assets/ico/arrow_right.svg'>"
                >
                    <thead class="thead-light">
                        <tr>
                            <th scope="col" data-sortable="true" data-formatter="convertDatetime" data-field="created_at">Date</th>
                            <th scope="col" data-field="user_email">User</th>
                            <th scope="col" data-formatter="descriptionFormatter.format" data-field="description">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>
    ` 
}

