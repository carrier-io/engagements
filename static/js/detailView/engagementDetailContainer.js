const TextEditableField = {
    props: {
        value: {},
        url: {},
        field: {},
        value_class: {
            default: ''
        },
        read_only: {
            default: false
        }
    },
    emits: ['updated'],
    data(){
        return {
            isEditing: false,
            isHovered: false,
        }
    },
    watch: {
        isEditing(newValue){
            if (newValue){
                this.$refs.fieldValue.focus()
            }
        }
    },
    computed: {
        editable(){
            return !this.read_only && this.isEditing
        },

        displayFieldName(){
            return this.field.replace('_', " ")
        },
    },
    methods: {
        openEdit(){
            this.isEditing = true;
            this.originalValue = this.$refs.fieldValue.innerHTML;
        },
        closeEdit(){
            this.isEditing = false;
            this.$refs.fieldValue.innerHTML = this.originalValue;
        },
        update(){
            payload = {}
            payload[this.field] = this.$refs.fieldValue.innerHTML
            axios.put(this.url, payload)
            .then(() => {
                this.isEditing = false
                this.$emit('updated', payload)
            })
            .catch(error => {
                data = error.response.data
                showNotify("ERROR", data['error'])
            })
        },
    },
    template:`
        <div class="desc-row">
            <div class="row-label"><span class="label">{{displayFieldName}}</span></div>
            <div class="row-value" :class="{'border-wrap': editable, 'wrappable': editable}" 
                @mouseleave="isHovered=false"
                @mouseover="isHovered=true"
            >
                <div ref="fieldValue" :class="value_class" :contenteditable="editable" placeholder="Not Specified">
                    <slot 
                        v-if="$slots.displayValue" 
                        name="displayValue"
                        :master="this"
                    ></slot>

                    <div v-else>
                        {{value}}
                    </div>

                </div>

                <div v-if="editable">
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
    `
}

const RichTextAreaField = {
    props: {
        value: {},
        url: {},
        field: {},
        value_class: {
            default: ''
        },
    },
    emits: ['updated'],
    data(){
        return {
            isEditing: false,
            isHovered: false,
            originalValue: null,
        }
    },
    computed: {
        displayFieldName(){
            return this.field.replace('_', " ")
        },
        parsedValue(){
            value = this.preprocessMarkdownText(this.value)
            return marked.parse(value, {mangle: false, headerIds: false})
        },  
    },
    methods: {
        preprocessMarkdownText(text) {
            const escapedCharRegex = /\\(.)/g;
            text = text.replace(escapedCharRegex, (match, p1) => p1);
            return text;
        },

        openEditField(){
            this.isEditing = true;
            this.originalValue = this.$refs.fieldValue.innerHTML;
            $(this.$refs.fieldValue).summernote();
        },

        closeEditField(){
            this.isEditing = false;
            $(this.$refs.fieldValue).summernote('destroy');
        },

        cancelEdit(){
            this.closeEditField()
            this.$refs.fieldValue.innerHTML = this.originalValue;
        },

        update(){
            payload = {}
            payload[this.field] = $(this.$refs.fieldValue).summernote('code')
            axios.put(this.url, payload)
            .then(() => {
                this.closeEditField()
                this.$emit('updated', payload)
            })
            .catch(error => {
                data = error.response.data
                showNotify("ERROR", data['error'])
            })
        },
    },
    template:`
        <div class="desc-row">
            <div class="row-label"><span class="label">{{displayFieldName}}</span></div>
            <div class="row-value wrappable" :class="{'border-wrap': isEditing}" data-id="1" 
                @mouseleave="isHovered=false"
                @mouseover="isHovered=true"
            >
                <div class="rich-text">
                    <div ref="fieldValue" :class="value_class" v-html="parsedValue">
                    </div>    
                </div>
                
                <div>
                    <div v-if="!isEditing && isHovered" class="text-edit" data-id="1">
                        <i @click="openEditField" class="icon__18x18 icon-edit mr-2" data-id="1"></i>
                    </div>

                    <div v-if="isEditing" class="row-actions" data-id="1">
                        <img src="/design-system/static/assets/ico/check_icon.svg" @click="update">
                        <img src="/design-system/static/assets/ico/cancel_icon.svg" @click="cancelEdit">
                    </div>
                </div>
            </div>
        </div>
    `
}

const DropDownField = {
    props: {
        value: {},
        url: {},
        field: {},
        options: {
            default: {}
        },
        value_class: {
            default: ''
        },
    },
    emits: ['updated'],
    data(){
        return {
            isHovered: false,
            newValue: this.value,
        }
    },
    mounted() {
        $(this.$refs.fieldValue).selectpicker('hide')
    },
    watch:{
        isHovered(value){
            if(value){
                this.refreshSelectPicker()
                return $(this.$refs.fieldValue).selectpicker('show')
            }
            $(this.$refs.fieldValue).selectpicker('hide')
        }
    },
    computed: {
        displayFieldName(){
            return this.field.replace('_', " ")
        },
        current(){
            return this.options.find(option => option.value==this.newValue)
        },
        title(){
            option = this.current
            if (option){
                return option['title']
            }
            return this.newValue
    
        },
    },
    methods: {
        refreshSelectPicker(){
            $(this.$refs.fieldValue).selectpicker('val', this.value)
            $(this.$refs.fieldValue).selectpicker('refresh')
            $(this.$refs.fieldValue).selectpicker('render')
        },

        update(){
            payload = {}
            payload[this.field] = this.newValue
            axios.put(this.url, payload)
                .then(response => {
                    this.refreshSelectPicker()
                    this.$emit('updated', payload)
                })
                .catch(error => {
                    data = error.response.data
                    showNotify("ERROR", data['error'])
                });
        },
    },
    template:`
        <div class="desc-row">
            <div class="row-label"><span class="label">{{displayFieldName}}</span></div>
            <div class="row-value"
                @mouseleave="isHovered=false"
                @mouseover="isHovered=true"
            >
                <div v-if="!isHovered" class="value">
                    <slot 
                        v-if="$slots.displayValue" 
                        name="displayValue"
                        :master="this"
                    ></slot>

                    <div v-else>
                        {{title}}
                    </div>
                </div>

                <select
                    ref="fieldValue"
                    @change="update"
                    class="selectpicker bootstrap-select__b bootstrap-select__sm" 
                    data-style="btn" 
                    :name="field"
                    v-model="newValue"
                    id="input-type"
                >
                    <option v-for="option in options" :key="option.value" :value="option.value">
                        {{option.title}}
                    </option>
                </select>
            </div>
        </div>
    `
}

const CustomField = {
    props: {
        extra_fields: {
            type: Object,
            default: []
        },
        url: {},
        value_class: {
            default: ''
        },
    },
    emits: ['updated'],
    data(){
        return {
            hoverFields: {},
            editingFields: {},
            originalValue: {},
        }
    },
    mounted(){
        this.extra_fields.forEach((option) => {
            this.hoverFields[option.id] = false
            this.editingFields[option.id] = false
        })
    },
    watch: {
        isEditing(newValue){
            if (newValue){
                this.$refs.fieldValue.focus()
            }
        }
    },
    methods: {
        openModal(){
            $('#extra-field-modal').modal('show')
        },

        closeModal(){
            $('#extra-field-modal').modal('hide')
            $("#custom_field").trigger('reset')
        },

        async createCustomField(){
            var newField = $("#custom_field").serializeObject();
            fields = [...this.extra_fields]
            newField['id'] = this.extra_fields.length + 1
            fields.push(newField)
            payload = {'custom_fields': fields}
            await this.makeRequest(payload)
            this.closeModal()
            this.$emit('updated', payload)
        },
        
        displayFieldName(field){
            return field.replace('_', " ")
        },
        setHover(fieldId){
            this.hoverFields[fieldId] = true;
        },
        clearHover(fieldId){
            this.hoverFields[fieldId] = false;
        },
        openEdit(fieldId){
            this.editingFields[fieldId] = true
            selector = `div#fieldValue_${fieldId}.value`
            this.originalValue[fieldId] = $(selector).text();
        },
        closeEdit(fieldId){
            this.editingFields[fieldId] = false
            selector = `div#fieldValue_${fieldId}.value`
            $(selector).text(this.originalValue[fieldId]);
        },
        async update(fieldId){
            fields = JSON.parse(JSON.stringify(this.extra_fields))
            field = fields.find(field => field.id==fieldId)
            selector = `div#fieldValue_${fieldId}.value`
            field['value'] = $(selector).text()
            data = {'custom_fields': fields}
            await this.makeRequest(data)
            this.editingFields[fieldId] = false
            this.$emit('updated', payload)
        },
        async makeRequest(payload){
            try{
                await axios.put(this.url, payload)
            } catch(err){
                data = err.response.data
                showNotify("ERROR", data['error'])
                return
            }   
        },
        async deleteField(fieldId){
            fields = this.extra_fields.filter(field => field.id != fieldId)
            payload = {'custom_fields': fields}
            await this.makeRequest(payload)
            delete this.editingFields[fieldId]
            this.$emit('updated', payload)
        },
    },
    template:`
        <div id="extra-field-modal" class="modal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Modal title</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="custom_field">
                        <div class="custom-input mb-3">
                            <label for="fieldTwo" class="font-weight-bold mb-1">Label</label>
                            <input type="text" placeholder="Text" name="field">
                        </div>

                        <div class="custom-input mb-3">
                            <label for="text-goal" class="font-weight-bold mb-1">Value</label>
                            <textarea class="form-control" name="value" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" @click="createCustomField">Save</button>
                </div>
                </div>
            </div>
        </div>

        <div class="desc-row" v-for="property in extra_fields" :key="property.id">
            
            <div class="row-label">
                <span class="label">
                    {{displayFieldName(property.field)}}
                </span>
            </div>
            
            <div class="row-value wrappable" :class="{'border-wrap': editingFields[property.id]}" 
                @mouseleave="clearHover(property.id)"
                @mouseover="setHover(property.id)"
            >
                <div :id="'fieldValue_'+property.id" :class="value_class" :contenteditable="editingFields[property.id]" placeholder="Not Specified">
                    {{property.value}}
                </div>

                <div>
                    <div v-if="!editingFields[property.id] && hoverFields[property.id]" class="text-edit">
                        <i @click="openEdit(property.id)" class="icon__18x18 icon-edit mr-1"></i>
                        <i @click="deleteField(property.id)" class="icon__18x18 icon-delete"></i>
                    </div>

                    <div v-if="editingFields[property.id]" class="row-actions">
                        <img src="/design-system/static/assets/ico/check_icon.svg" @click="update(property.id)">
                        <img src="/design-system/static/assets/ico/cancel_icon.svg" @click="closeEdit(property.id)">
                    </div>
                </div>

            </div>
        </div>

        <div class="desc-row">
            <div class="row-label">
                <span class="label">
                </span>
            </div>
            
            <div class="row-value">
                <div @click="openModal" class="d-flex justify-content-center align-items-center">
                    <i class="icon__16x16 icon-plus__16 mr-1" style="background: #2772E2"></i>
                    <span class="blue-link  mr-2">Add description</span>
                </div>
            </div>
        </div>
    `

}

const EngagementDetailContainer = {
    props: ["engagement"],
    emits: ['updated'],
    components: {
        'text-field': TextEditableField,
        'rich-textarea-field': RichTextAreaField,
        'drop-down-field': DropDownField,
        'custom-field': CustomField,
    },
    computed:{
        updateUrl(){
            return engagements_url + '/' + this.engagement.hash_id
        },
        datesValues(){
            return this.formatDate(this.engagement.start_date) + ' - ' + this.formatDate(this.engagement.end_date)
        },
    },
    methods: {
        getHealth(value){
            healthStatus = this.healthOpts.find(option => option.value==value)
            if (!healthStatus){
                return {
                    title: 'Not defined',
                    value: 'not_defined',
                    color: '#CAD1D7'
                }
            }
            return healthStatus
        },

        formatDate(dateStr){
            date = new Date(dateStr)
            day = date.getDate();
         //   day = day < 10 ? '0' + day: `${day}`
            year = date.getFullYear()
            month = date.getMonth() + 1
          //  month = month < 10 ? '0' + month: `${month}`
            return `${day}.${month}.${year}`
        },

        propagateEvent(data){
            this.$emit('updated', data)
        },
    },
    data(){
        return {
            extra_fields:[
                {
                    id: 1,
                    field: 'Main contact',
                    value: "peter_paker@gmail.com", 
                },
                {   
                    id: 2,
                    field: 'Secondary contact',
                    value: "andy_paker@gmail.com", 
                },
                {
                    id: 3,
                    field: 'Phone',
                    value: "(93)778-89-90", 
                }
            ],

            statusOpts: [
                {
                    title: 'New',
                    value: 'new',
                }, 
                {
                    title: 'In progress',
                    value: 'in_progress',
                }, 
                {
                    title: 'Done',
                    value: 'done',
                },
                
            ],
            healthOpts: [
                {
                    title: 'Good',
                    value: 'good',
                    color: '#139A41'
                },
                {
                    title: 'Warning',
                    value: 'warning',
                    color: '#E97912'
                },
                {
                    title: 'Bad',
                    value: 'bad',
                    color: '#D71616'
                },
                {
                    title: 'Not defined',
                    value: 'not_defined',
                    color: '#CAD1D7'
                },
                {
                    title: 'Dead',
                    value: 'dead',
                    color: '#32325D'
                },
            ],
        }
    },
    template: `
        <div class="description-container">
            <text-field
                :value="datesValues"
                :url="updateUrl"
                field="dates"
                value_class="value"
                read_only="true"
                @updated="propagateEvent"
            ></text-field>

            <rich-textarea-field
                :value="engagement?.goal"
                :url="updateUrl"
                field="goal"
                value_class="value"
                @updated="propagateEvent"
            ></rich-textarea-field>

            <drop-down-field
                :value="engagement.status"
                :url="updateUrl"
                field="status"
                :options="statusOpts"
                @updated="propagateEvent"
            >
            </drop-down-field>

            <text-field
                :value="engagement.health"
                :url="updateUrl"
                field="health"
                :options="healthOpts"

                @updated="propagateEvent"
            >
                <template #displayValue="{master}">
                    <div class="d-flex align-items-end mr-2">
                        <div class="d-inline-block">{{getHealth(master.value).title}}</div>
                    </div>
                </template>
            </text-field>


            <custom-field
                :extra_fields="engagement.custom_fields"
                :url="updateUrl"
                value_class="value"
                @updated="propagateEvent"
            >
            </custom-field>
            

        </div>    
    `
}