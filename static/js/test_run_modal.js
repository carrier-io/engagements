const TestRunModal = {
    delimiters: ['[[', ']]'],
    props: ['test_params_id', 'instance_name_prefix', 'result_table_id', 'api_base_url'],
    template: `
        <div class="modal modal-base fixed-left fade shadow-sm" tabindex="-1" role="dialog" id="runTestModal">
            <div class="modal-dialog modal-dialog-aside" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="row w-100">
                            <div class="col">
                                <h2>Run UI Test</h2>
                            </div>
                            <div class="col-xs">
                                <button type="button" class="btn btn-secondary mr-2" data-dismiss="modal" aria-label="Close">
                                    Cancel
                                </button>
                                <button type="button" class="btn btn-basic" 
                                    @click="handleRun"
                                >
                                    Run test
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-body">
                        <slot name="test_parameters"></slot>
                        <Locations 
                            v-model:location="location"
                            v-model:parallel_runners="parallel_runners"
                            v-model:cpu="cpu_quota"
                            v-model:memory="memory_quota"
                            v-model:cloud_settings="cloud_settings"
                                  
                            ref="locations"
                        ></Locations>
                        <slot name="integrations"></slot>
                    </div>
                </div>
            </div>
        </div>
    `,
    computed: {
        test_parameters() {
            return ParamsTable.Manager(this.$props.test_params_id)
        },
        integrations() {
            try {
                return IntegrationSection.Manager(this.$props.instance_name_prefix)
            } catch (e) {
                console.warn('No integration section')
                return undefined
            }
        },
    },
    mounted() {
        $(this.$el).on('hide.bs.modal', this.clear)
        $(this.$el).on('show.bs.modal', this.$refs.locations.fetch_locations)
    },
    data() {
        return this.initial_state()
    },
    methods: {
        initial_state() {
            return {
                id: null,
                test_uid: null,

                location: 'default',
                parallel_runners: 1,
                cpu_quota: 1,
                memory_quota: 4,
                cloud_settings: {},

                env_vars: {},
                // customization: {},
                cc_env_vars: {},

                errors: {},
            }
        },
        set(data) {
            console.log('set data called', data)
            const {test_parameters, env_vars: all_env_vars, integrations, ...rest} = data

            const {cpu_quota, cloud_settings, memory_quota, ...env_vars} = all_env_vars

            // common fields
            Object.assign(this.$data, {...rest, cpu_quota, cloud_settings, memory_quota, env_vars,})

            // special fields
            this.test_parameters.set(test_parameters)
            this.integrations.set(integrations)
            this.show()
        },
        show() {
            $(this.$el).modal('show')
        },
        hide() {
            $(this.$el).modal('hide')
            // this.clear() // - happens on close event
        },
        clear() {
            Object.assign(this.$data, this.initial_state())
            this.test_parameters.clear()
            this.integrations.clear()
        },
        clearErrors() {
            this.errors = {}
        },
        get_data() {
            const test_params = this.test_parameters.get()
            const integrations = this.integrations.get()
            const name = test_params.find(i => i.name === 'test_name')
            const test_type = test_params.find(i => i.name === 'test_type')
            const env_type = test_params.find(i => i.name === 'env_type')

            return {
                common_params: {
                    name: name,
                    test_type: test_type,
                    env_type: env_type,
                    env_vars: {
                        cpu_quota: this.cpu_quota,
                        memory_quota: this.memory_quota,
                        cloud_settings: this.cloud_settings,
                        ENV: env_type["default"]
                    },
                    parallel_runners: this.parallel_runners,
                    location: this.location
                },
                test_parameters: test_params,
                integrations: integrations,
            }
        },
        async handleRun() {
            this.clearErrors()
            const resp = await fetch(`${this.$props.api_base_url}/test/${getSelectedProjectId()}/${this.id}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.get_data())
            })
            if (resp.ok) {
                this.hide()
                $(`#${this.result_table_id}`).bootstrapTable('refresh')
            } else {
                await this.handleError(resp)
            }
        },
        async handleError(response) {
            try {
                const error_data = await response.json()
                this.errors = error_data?.reduce((acc, item) => {
                    const [errLoc, ...rest] = item.loc
                    item.loc = rest
                    if (acc[errLoc]) {
                        acc[errLoc].push(item)
                    } else {
                        acc[errLoc] = [item]
                    }
                    return acc
                }, {})

            } catch (e) {
                alertCreateTest.add(e, 'danger-overlay', true, 5000)
            }
        },
    },
    watch: {
        errors(newValue,) {
            if (Object.keys(newValue).length > 0) {
                newValue.test_parameters ?
                    this.test_parameters.setError(newValue.test_parameters) :
                    this.test_parameters.clearErrors()
                newValue.integrations ?
                    this.integrations?.setError(newValue.integrations) :
                    this.integrations?.clearErrors()
            } else {
                this.test_parameters.clearErrors()
                this.integrations.clearErrors()
            }
        }
    },
}
register_component('TestRunModal', TestRunModal)


var custom_params_table_formatters = {
    input(value, row, index, field) {
        if (['test_name', 'test_type', 'env_type'].includes(row.name)) {
            return `
                <input type="text" class="form-control form-control-alternative" disabled
                    onchange="ParamsTable.updateCell(this, ${index}, '${field}')" value="${value}">
                <div class="invalid-tooltip invalid-tooltip-custom"></div>
            `
        }
        return ParamsTable.inputFormatter(value, row, index, field)

    },
    action(value, row, index, field) {
        if (['test_name', 'test_type', 'env_type'].includes(row.name)) {
            return ''
        }
        return ParamsTable.parametersDeleteFormatter(value, row, index)
    }
}