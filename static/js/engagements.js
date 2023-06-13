var currentEngagementId = null;

$(document).on('vue_init', async () => {
  createModal = $("#create_modal")

  createModal.on("show.bs.modal", function () {
    $("#form-create").get(0).reset();
  });

  $("#save").click(function() {
      data = $("#form-create").serializeObject();
      axios.post(engagements_url, data)
          .then(resp => {
              $("#table").bootstrapTable("refresh", {});
              createModal.modal("hide");
              showNotify("SUCCESS", 'Successfully created')
          })
          .catch(err => {
              console.log(err)
          })
  });

  $("#edit").click(function(){
      data = $("#form-edit").serializeObject()
      axios.put(engagements_url+'/'+ currentEngagementId, data)
          .then(resp => {
              $("#table").bootstrapTable("refresh", {});
              $("#edit_modal").modal("hide")
              showNotify("SUCCESS", 'Successfully updated')
          })
          .catch(err => {
              console.log(err)
          })
  });

  $('#refreshTable').click(function() {
    $('#table').bootstrapTable('refresh');
  });

});


function actionsFormatter(value, row, index) {
    return [
      '<a class="edit-event mr-3" href="javascript:void(0)" title="Edit">',
      '<i class="icon__18x18 icon-edit"></i>',
      '</a>',
      '<a class="delete-event" href="javascript:void(0)" title="Delete">',
      '<i class="icon__18x18 icon-delete"></i>',
      '</a>',
    ].join('')
}


function goalFormatter(value, row, index){
  if (value.length > 350){
    return value.slice(0, 350) + '...'
  }
  return value
}

window.actionsEvents = {
    "click .edit-event": function (e, value, row, index) {
        $("#edit_modal").modal("show");
        currentEngagementId = row.hash_id
        $.each($("form#form-edit .form-control"), (ind, tag)  => {
            tag.value = row[tag.name]
        })
    },

    "click .delete-event": function (e, value, row, index) {
      axios.delete(engagements_url + "/" + row.hash_id)
        .then(function (response) {
          $("#table").bootstrapTable("remove", {
            field: "id",
            values: [row.id]
          });
          showNotify("SUCCESS", 'Successfully deleted')
        })
        .catch(function (error) {
          console.log(error);
        });
    }
};
  

const EngagementsTable = {
  props: ['engagement'],
  components: {
      'filter-toolbar-container': FilterToolbarContainer,
  },
  watch: {
    engagement(value){
        if (value.id == -1){
          this.refreshTable(this.engagements_url)
        }
    }
  },
  data() {
      return {
          engagements_url: engagements_url,
          url: engagements_url,
          noTicketSelected: true,
          preFilterMap: {},
          table_id: "#engagements-table"
      }
  },
  mounted(){
    $(this.table_id).bootstrapTable("load");
    this.setTableCheckEvents()
  },
  methods: {
      // Table events
      setTableCheckEvents(){
          $(this.table_id).on('check.bs.table', ()=>{
              this.noTicketSelected = false;
          })
          $(this.table_id).on('check-all.bs.table', ()=>{
              this.noTicketSelected = false;
          })
          $(this.table_id).on('check-all.bs.table', ()=>{
              this.noTicketSelected = false;
          })
          $(this.table_id).on('uncheck.bs.table', ()=>{
              rows = $(this.table_id).bootstrapTable('getSelections')
              this.noTicketSelected = rows.length == 0 ? true : false               
          })
          $(this.table_id).on('uncheck-all.bs.table', ()=>{
              this.noTicketSelected = true
          })

          document.addEventListener('newEngagement', ()=>{
            this.refreshTable(this.engagements_url)
          });
      },
      // Table methods
      refreshTable(queryUrl, reload=true){
          this.engagements_url = queryUrl
          if(reload){
              $(this.table_id).bootstrapTable("refresh", {
                  url: this.engagements_url
              })
          }
      },
      deleteTickets() {
          const ids_to_delete = $(this.table_id).bootstrapTable('getSelections').map(
              item => $.param({"id[]": item.id})
          ).join('&')
          const url = `${issues_api_url}?` + ids_to_delete
          fetch(url, {
              method: 'DELETE'
          }).then(response => {
              this.noTicketSelected = true
              msg = response.ok ? "Successfully deleted" : "Deletion failed"
              msgType = response.ok ? "SUCCESS" : "ERROR"
              showNotify(msgType, msg)
              this.refreshTable(this.engagements_url)
          })
          .catch(error =>{
              console.log(error)
              showNotify("ERROR", "Deletion failed")
          })
      },
  },
  template: `
    <div class="card mt-3 mr-3 card-table-sm w-100">
      <filter-toolbar-container
        variant="slot"
        :url="url"
        :table_id="table_id"
        button_class="btn-sm btn-icon__sm btn-secondary"
        :list_items="['severity', 'type', 'source', 'status', 'tags']"
        :pre_filter_map="preFilterMap"
        @applyFilter="refreshTable"
      >
        <template #title>
            <h4>Engagements</h4>  
        </template>

        <template #before>
            <div class="custom-input custom-input_search__sm mr-2 position-relative">
                <input
                    id="search-bar"
                    type="text"
                    placeholder="Search">
                <img src="/issues/static/ico/search.svg" class="icon-search position-absolute">
            </div>
        </template>
        
        <template #dropdown_button><i class="fa fa-filter"></i></template>
        
        <template #after>
            <button type="button" 
                @click="deleteTickets"
                :disabled="noTicketSelected"
                class="btn btn-secondary btn-sm btn-icon__sm mr-2">
                <i class="fas fa-trash-alt"></i>
            </button>
        </template>

      </filter-toolbar-container>

      <div class="card-body">
        <table class="table table-borderless"
            id="engagements-table"
            :data-url="engagements_url"
            data-toggle="table"
            data-unique-id="id"
            data-virtual-scroll="true"
            data-data-field="items"
            data-pagination="true"
            data-page-list="[10, 25, 50, 100, all]"
            data-side-pagination="server"
            data-pagination-pre-text="<img src='/design-system/static/assets/ico/arrow_left.svg'>"
            data-pagination-next-text="<img src='/design-system/static/assets/ico/arrow_right.svg'>"
        >
          <thead class="thead-light">
            <tr>
                <th scope="col" data-checkbox="true"></th>
                <th data-field="name">Name</th>
                <th data-field="goal" data-width="30" data-width-unit="%" data-formatter="goalFormatter">Goal</th>
                <th data-field="start_date">Start Date</th>
                <th data-field="end_date">End Date</th>
                <th data-field="status">Status</th>
                <th scope="col" data-align="right" data-cell-style="cellStyle" data-formatter="actionsFormatter" data-events="actionsEvents">Actions</th>
            </tr>
          </thead>
        </table>
      </div>
    </div>
  `
}