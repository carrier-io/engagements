const EngagementCreationModal = {
    emits: ['added'],
    data() {
        return {
            formId: "#eng-form-create",
            tableId: "#engagement-table",
            modalId: "#eng_create_modal",
        }
    },
    mounted(){
        $(this.modalId).on("show.bs.modal", () => {
            $(this.formId).get(0).reset();
        });
    },
    methods: {
        save() {
            data = $(this.formId).serializeObject();
            axios.post(engagements_list, data)
                .then(() => {
                    this.$emit('added')
                    $(this.modalId).modal("hide");
                    showNotify("SUCCESS", 'Successfully created')
                })
                .catch(err => {
                    console.log(err)
                })
        }
    },
    template: `
        <div id="eng_create_modal" class="modal modal-small fixed-left fade shadow-sm" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-dialog-aside" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="row w-100">
                            <div class="col">
                                <h2>Create  Engagement</h2>
                            </div>
                            <div class="col-xs">
                                <button type="button" class="btn  btn-secondary mr-2" data-dismiss="modal" aria-label="Close">
                                    Cancel
                                </button>
                                <button type="button" @click="save" class="btn btn-basic">Save</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-body">
                        <form id="eng-form-create">
                            <div class="section p-1">
                                <div class="custom-input mb-3">
                                    <label for="input-name" class="font-weight-bold mb-1">Engagement Name</label>
                                    <input type="text" name="name" id="input-name">
                                </div>
            
                                <div class="custom-input mb-3">
                                    <label for="text-goal" class="font-weight-bold mb-1">Goal</label>
                                    <textarea class="form-control" name="goal" rows="8" id="text-goal"></textarea>
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
                                            <input type="date" name="start_date" class="form-control">
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="end_date" class="font-weight-bold mb-1">End Date</label>
                                            <input type="date" name="end_date" class="form-control">
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

const TopEngagementCard = {
    props: ["engagement"],
    data() {
        return {}
    },
    methods: {
        stringifyDate(date){
            return date
        },

    },
    template: `
    <div class="card mt-3 p-2">
        <div class="card-header mb-0">
            <div class="d-flex justify-content-between mb-1">
                <p class="font-h4 font-bold">{{engagement.name}}</p>
                <button class="btn btn-default btn-xs btn-table btn-icon__xs">
                    <i class="icon__18x18 icon-settings"></i>
                </button>
            </div>
            <div class="d-flex align-items-center">
                <div class="d-flex align-items-end mr-2">
                    <i class="icon__16x16 icon-circle-green__16"></i> 
                    <div class="d-inline-block">Green</div>
                </div>
                <div class="d-flex align-items-center">
                    <i class="icon__18x18 icon-date-picker mr-1"></i>
                    <div>
                        {{stringifyDate(engagement.start_date)}} - {{stringifyDate(engagement.end_date)}}
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
}

register_component('engagement-card', TopEngagementCard);


const EngagementsListAside = {
    emits: ['engagementSelected', 'engagementsListUpdated'],
    data() {
        return {
            engagementsTableId: "#engagement-table",
            currentEngIndex: null,
            engagementCount: 0,
            selectedEngagementRowIndex: 0,
            selectedEngagement: null,
            engagements: null,
        }
    },
    mounted() {
        this.fetchEngagements().then(data => {
            this.setStateAndEvents(data)
        })
    },
    components: {
        'engagement-creation-modal': EngagementCreationModal,
    },
    computed: {
        responsiveTableHeight() {
            return `${(window.innerHeight - 235)}px`;
        }
    },
    methods: {
        async fetchEngagements() {
            const res = await fetch (`/api/v1/engagements/engagements/${getSelectedProjectId()}`,{
                method: 'GET',
            })
            return res.json();
        },
        SET_ENGAGEMENTS(engagements){
            this.engagements = engagements
            this.$emit('engagementsListUpdated', engagements)
        },
        SET_ENGAGEMENT(engagement, index){
            this.selectedEngagement = engagement
            this.selectedEngagementRowIndex = index
            this.$emit('engagementSelected', engagement)
        },
        selectEngagement(index) {
            $('#engagement-table tbody tr').each((i, item) => {
                if(i === index) {
                    const firstRow = $(item);
                    firstRow.addClass('highlight');
                    engagement = $('#engagement-table').bootstrapTable('getData')[index];
                    this.SET_ENGAGEMENT(engagement, index)
                }
            })
        },
        setEvent(engagementList) {
            vm = this
            $('#engagement-table').on('click', 'tbody tr:not(.no-records-found)', function(){
                const selectedUniqId = parseInt(this.getAttribute('data-uniqueid'));
                for (let i=0; i<engagementList.length; i++){
                    engagement = engagementList[i]
                    if (engagement.id === selectedUniqId){
                        vm.SET_ENGAGEMENT(engagement, i)
                    }
                }
                $(this).addClass('highlight').siblings().removeClass('highlight');
            });
        },
        setStateAndEvents(data, index=0){
            engagements = data['items']
            engagements.unshift({id: -1, name:'All engagements'})
            $(this.engagementsTableId).bootstrapTable('append', engagements);
            this.SET_ENGAGEMENTS(engagements)
            this.setEvent(engagements)
            this.engagementCount = data['total'];
            if (data['total'] > index) {
                this.selectEngagement(index);
            }
        },
        refreshEngagements(){
            currentEngIndex = this.selectedEngagementRowIndex
            this.fetchEngagements().then(data => {
                $(this.engagementsTableId).bootstrapTable("removeAll")
                this.setStateAndEvents(data, currentEngIndex)
            })
        },

    },
    template: `
        <aside id="engagement-wrapper" class="m-3 card card-table-sm" style="width: 340px">
            <div class="row px-4 pt-4">
                <div class="col-8">
                    <h4>Engagements</h4>
                </div>
                <div class="col-4">
                    <div class="d-flex justify-content-end">
                        <button type="button"
                            data-toggle="modal" 
                            data-target="#eng_create_modal"
                            class="btn btn-secondary btn-sm btn-icon__sm"
                        >
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
            <hr class="hr mb-0" />
            <div class="card-body" style="padding-top: 0">
                <table class="table table-borderless table-fix-thead"
                    id="engagement-table"
                    data-toggle="table"
                    data-show-header="false"
                    data-unique-id="id">
                    <thead class="thead-light bg-transparent">
                        <tr>
                            <th data-visible="false" data-field="id">index</th>
                            <th data-formatter="nameFormatter" data-field="name" class="engagement-name">NAME</th>
                        </tr>
                    </thead>
                    <tbody :style="{'height': responsiveTableHeight}">
                    </tbody>
                </table>
                <div class="p-3">
                    <span class="font-h5 text-gray-600">{{ engagementCount }} items</span>
                </div>
            </div>
        </aside>

        <engagement-creation-modal
            @added="refreshEngagements"
        >
        </engagement-creation-modal>
    `
}

function nameFormatter(value, row){
    allEngagement = row['id'] == -1
    if(allEngagement){
        return value
    }
    txt = `<div class="pl-2 d-flex align-items-end">
                <i class="icon__16x16 icon-circle-green__16"></i>
                ${value}
            </div>`
    return txt
}

const OverviewCard = {
    props: {
        url: {},
        engagement: {
            default: null,
        },
        engagements_count:{
            default: 0
        },
    },
    data() {
        return {
            stats: {},
            in_progress: 0,
            done: 0,
            activity: 0,
            vulnerability: 0
        }
    },
    watch: {
        async engagement(){
            await this.fetchStats()
        },
    },
    async mounted(){
        await this.fetchStats() 
    },
    methods: {
        SET_STATS(data){
            this.stats = data
            this.in_progress = data['state_count']['in_progress'] ? data['state_count']['in_progress'] : 0 
            this.done = data['state_count']['done'] ? data['state_count']['done'] : 0 
            this.activity = data['types_count']['Activity'] ? data['types_count']['Activity']: 0
            this.vulnerability = data['types_count']['Vulnerability']?data['types_count']['Vulnerability']:0
        },
        async fetchStats(){
            params = {}
            if (this.engagement){
                params = {params: {engagement: this.engagement.hash_id}}
            }
            const resp = await axios.get(this.url, params)
            this.SET_STATS(resp.data)
        },
    },
    template: `
        <div class="card mt-3 p-2">
            <div class="card-body">
                <div class="row">
                    
                    <div class="col" v-if="!engagement">
                        <div class="card card-sm card-gray">
                            <div class="card-header">{{engagements_count}}</div>
                            <div class="card-body">ENGAGEMENTS</div>
                        </div>
                    </div>
                    
                    <div class="col">
                        <div class="card card-sm card-gray">
                            <div class="card-header">{{stats['total']}}</div>
                            <div class="card-body">TICKETS</div>
                        </div>
                    </div>
                    
                    <div class="col" v-if="engagement">
                        <div class="card card-sm card-gray">
                            <div class="card-header">{{in_progress}}</div>
                            <div class="card-body">IN PROGRESS</div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card card-sm card-gray">
                            <div class="card-header">{{done}}</div>
                            <div class="card-body">TICKETS DONE</div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card card-sm card-gray">
                            <div class="card-header">{{activity}}</div>
                            <div class="card-body">Bugs</div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card card-sm card-gray">
                            <div class="card-header">{{vulnerability}}</div>
                            <div class="card-body">Findings</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `
}

register_component('overview-card', OverviewCard);


const EngagementContainer = {
    props: {
        overview: {
            type: Boolean,
            default: false
        }
    },
    components: {
        'engagement-aside': EngagementsListAside,
    },
    data() {
        return {
            engagements: [],
            selectedEngagement: {
                id: -1,
                name: ''
            },
        }
    },
    methods: {
        updateEngagements(engagements){
            this.engagements = engagements
        },
        setSelectedEngagement(engagement){
            this.selectedEngagement = engagement
        }
    },
    template: ` 
        <main class="d-flex align-items-start justify-content-center mb-3">
            <engagement-aside
                @engagementsListUpdated="updateEngagements"
                @engagementSelected="setSelectedEngagement"
            >
            </engagement-aside>
            <div class="w-100 mr-3">
                <div v-if="selectedEngagement.id!=-1">
                    <slot name="in_engagement_navbar" :master="this">
                    </slot>
                </div>
                <div v-else>
                    <slot name="general_navbar" :master="this">
                    </slot>
                </div>
                <div>
                    <slot name="content" :master="this">
                    </slot>
                </div>
            </div>
        </main>
    `
};

register_component('engagement-container', EngagementContainer);