var currentEngagementId = null;
var boardsList = [];

function getSelectedBoardsList(multiselect){
  let selectedItems = multiselect.selectedItems
  let list = []
  selectedItems.forEach(item => list.push(item['id']))
  return list
}

async function getBoardsList(){
  try {
    const response = await axios.get(boards_url)
    items = response.data['items']
    items.forEach(item => {
      boardsList.push({
        'id': item['hash_id'],
        'title': item['name']
      })
    })

  } catch(err) {
    console.log(err)
  }
}

$(document).on('vue_init', async () => {
  createModal = $("#create_modal")

  await getBoardsList()

  createModal.on("show.bs.modal", function () {
    $("#form-create").get(0).reset();
    multiselect = vueVm.registered_components.kanban_boards_select
    multiselect.selectedItems = []
    multiselect.itemsList = boardsList
  });

  $("#save").click(function() {
      data = $("#form-create").serializeObject();
      data['kanban_boards'] = getSelectedBoardsList(vueVm.kanban_boards_select)
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
      data['kanban_boards'] = getSelectedBoardsList(vueVm.edit_boards_select)
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
      '<a class="kanban-board-url mr-3" href="'+ kanban_url + '?engagement='+row.hash_id +'" title="Kanban Boards">',
      '<i class="fa-brands fa-trello" style="color: #858796"></i>',
      '</a>',
      '<a class="mr-3" href="' + view_url + '?id=' + row.id + '" title="View">',
      '<i class="fa fa-eye" style="color: #858796"></i>',
      '</a>',
      '<a class="edit-event mr-3" href="javascript:void(0)" title="Edit">',
      '<i class="fa-regular fa-pen-to-square" style="color: #858796"></i>',
      '</a>',
      '<a class="delete-event" href="javascript:void(0)" title="Delete">',
      '<i class="fa fa-trash" style="color: #858796"></i>',
      '</a>',
    ].join('')
}


window.actionsEvents = {
    "click .edit-event": function (e, value, row, index) {
        $("#edit_modal").modal("show");
        currentEngagementId = row.hash_id
        $.each($("form#form-edit .form-control"), (ind, tag)  => {
            tag.value = row[tag.name]
        })

        multiselect = vueVm.registered_components.edit_boards_select
        items = boardsList.filter(board => row.kanban_boards.includes(board['id']))
        multiselect.selectedItems = items
        multiselect.itemsList = boardsList
        
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
  