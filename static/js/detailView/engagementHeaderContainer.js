const EngagementEditModal = {
    props: {
        engagement: {},
    },
    computed: {
        updateUrl(){
            return engagements_url + '/' + this.engagement.hash_id
        },
    },
    emits: ['updated'],
    methods: {
        update(){
            data = $("#eng-form-edit").serializeObject()
            axios.put(this.updateUrl, data)
                .then(resp => {
                    $("#eng_edit_modal").modal("hide")
                    showNotify("SUCCESS", 'Successfully updated')
                    this.$emit('updated', resp.data['item'])
                })
                .catch(err => {
                    console.log(err)
                })
        },
    },
    data(){
        return {
        }
    },
    template: `
        <div id="eng_edit_modal" class="modal modal-small fixed-left fade shadow-sm" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-dialog-aside" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="row w-100">
                            <div class="col">
                                <h2>Edit Engagement</h2>
                            </div>
                            <div class="col-xs">
                                <button type="button" class="btn  btn-secondary mr-2" data-dismiss="modal" aria-label="Close">
                                    Cancel
                                </button>
                                <button @click="update" type="button" id="edit" class="btn btn-basic">Save</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-body">
                        <form id="eng-form-edit">
                            <div class="section p-1">

                                <div class="custom-input mb-3">
                                    <label for="input-name" class="font-weight-bold mb-1">Engagement Name</label>
                                    <input type="text" name="name" id="input-name" class="field">
                                </div>
            
                                <div class="custom-input mb-3">
                                    <label for="text-goal" class="font-weight-bold mb-1">Goal</label>
                                    <textarea class="form-control field" name="goal" rows="8" id="text-goal"></textarea>
                                </div>

                                <div class="mb-3">
                                    <label for="text-goal" class="font-weight-bold mb-1">Status</label>
                                    <div class="d-flex">
                                        <select class="selectpicker bootstrap-select__b flex-grow-1" data-style="btn">
                                            <option value="new">New</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="done">Done</option>
                                        </select>
                                    </div>
                                </div>  

                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="start_date" class="font-weight-bold mb-1">Start Date</label>
                                            <input type="date" name="start_date" class="form-control field">
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="end_date" class="font-weight-bold mb-1">End Date</label>
                                            <input type="date" name="end_date" class="form-control field">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
}



const EngagementHeaderContainer = {
    props: {
        engagement: {},
    },
    components:{
        'edit-modal': EngagementEditModal,
    },
    computed: {
        updateUrl(){
            return engagements_url + '/' + this.engagement.hash_id
        },
    },
    emits: ['updated', 'close', 'deleted'],
    watch: {
        isEditing(newValue){
            if (newValue){
                this.$refs.fieldValue.focus()
            }
        }
    },
    methods: {
        close(){
            this.$emit('close', null)
        },
        openEdit(){
            this.isEditing = true;
            this.originalValue = this.$refs.fieldValue.innerHTML;
        },
        openEditModal(){
            $("#eng_edit_modal").modal("show");
            $('form#eng-form-edit .selectpicker').selectpicker('val', this.engagement.status)
            $.each($("form#eng-form-edit .field"), (ind, tag)  => {
                tag.value = this.engagement[tag.name]
            })
            $('form#eng-form-edit #text-goal').summernote({
                height: 150,
                focus: true,
                toolbar: [
                    ['style', ['bold', 'italic', 'underline', 'clear']],
                    ['color', ['color']],
                    ['fontname', ['fontname']],
                    ['para', ['ul', 'ol', 'paragraph']],
                  ]
            });
            $('form#eng-form-edit #text-goal').summernote('code', this.engagement.goal)
        },
        closeEdit(){
            this.isEditing = false;
            this.$refs.fieldValue.innerHTML = this.originalValue;
        },
        deleteEng(){
            axios.delete(this.updateUrl)
            .then(response => {
                this.$emit('deleted', this.engagement.hash_id)
                showNotify("SUCCESS", 'Successfully deleted')
            })
            .catch(function (error) {
              console.log(error);
            });
        },
        update(){
            payload = {}
            payload['name'] = this.$refs.fieldValue.innerHTML
            axios.put(this.updateUrl, payload)
            .then(() => {
                this.isEditing = false
                this.$emit('updated', payload)
            })
            .catch(error => {
                data = error.response.data
                showNotify("ERROR", data['error'])
            })
        },
        propagateEvent(payload){
            this.$emit('updated', payload)
        },
    },
    data(){
        return {
            isEditing: false,
            isHovered: false,
        }
    },
    template: `
        <edit-modal
            :engagement="engagement"
            @updated="propagateEvent"
        >
        </edit-modal>
        <div class="ticket-header-container">
            <div class="header-row">

                <div class="row-value wrappable"  
                    @mouseleave="isHovered=false"
                    @mouseover="isHovered=true"
                    :class="{'border-wrap': isEditing}"
                    style="padding: 4px"
                >
                    <div
                        ref="fieldValue" 
                        :contenteditable="isEditing" 
                        class="ticket-header" 
                    >
                        {{engagement?.name}}
                    </div>

                    <div>
                        <div v-if="!isEditing && isHovered" class="text-edit">
                            <i @click="openEdit" class="icon__18x18 icon-edit mr-2"></i>
                        </div>

                        <div v-if="isEditing" class="row-actions">
                            <img src="/design-system/static/assets/ico/check_icon.svg" @click="update">
                            <img src="/design-system/static/assets/ico/cancel_icon.svg" @click="closeEdit">
                        </div>
                    </div>
                </div>
            </div>

            <div class="header-icon">
                <i @click="openEditModal" class="icon__18x18 icon-edit mr-2"></i>
                <i @click="deleteEng" class="icon__18x18 icon-delete"></i>
            </div>
        </div>
    `
}