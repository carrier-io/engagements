function engagementQueryParams(params){
    const urlSearchParams = new URLSearchParams(window.location.search);
    const currentParams = Object.fromEntries(urlSearchParams.entries());
    params['filter'] = JSON.stringify({'engagement': currentParams['hash_id']})
    return params
}


var ui_report_formatters = {
    createLinkToTest(value, row, index) {
        return `<a class="test form-control-label font-h5" href="${ui_perf_results_url}?result_id=${row.id}" role="button">${row.name}</a>`
    } 
}

var report_formatters = {
    reportsStatusFormatter(value, row, index) {
        switch (value.status.toLowerCase()) {
            case 'error':
                return `<div data-toggle="tooltip" data-placement="top" title="${value.description}" style="color: var(--red)"><i class="fas fa-exclamation-circle error"></i> ${value.status}</div>`
            case 'failed':
                return `<div data-toggle="tooltip" data-placement="top" title="${value.description}" style="color: var(--red)"><i class="fas fa-exclamation-circle error"></i> ${value.status}</div>`
            case 'success':
                return `<div data-toggle="tooltip" data-placement="top" title="${value.description}" style="color: var(--green)"><i class="fas fa-exclamation-circle error"></i> ${value.status}</div>`
            case 'canceled':
                return `<div data-toggle="tooltip" data-placement="top" title="${value.description}" style="color: var(--gray)"><i class="fas fa-times-circle"></i> ${value.status}</div>`
            case 'finished':
                return `<div data-toggle="tooltip" data-placement="top" title="${value.description}" style="color: var(--info)"><i class="fas fa-check-circle"></i> ${value.status}</div>`
            case 'in progress':
                return `<div data-toggle="tooltip" data-placement="top" title="${value.description}" style="color: var(--basic)"><i class="fas fa-spinner fa-spin fa-secondary"></i> ${value.status}</div>`
            case 'post processing':
                return `<div data-toggle="tooltip" data-placement="top" title="${value.description}" style="color: var(--basic)"><i class="fas fa-spinner fa-spin fa-secondary"></i> ${value.status}</div>`
            case 'pending...':
                return `<div data-toggle="tooltip" data-placement="top" title="${value.description}" style="color: var(--basic)"><i class="fas fa-spinner fa-spin fa-secondary"></i> ${value.status}</div>`
            case 'preparing...':
                return `<div data-toggle="tooltip" data-placement="top" title="${value.description}" style="color: var(--basic)"><i class="fas fa-spinner fa-spin fa-secondary"></i> ${value.status}</div>`
            default:
                return value.status.toLowerCase()
        }
    },
    createLinkToTest(value, row, index) {
        return `<a class="test form-control-label font-h5" href="${back_perf_results_url}?result_id=${row.id}" role="button">${row.name}</a>`
    }
}



var ui_test_formatters = {
    runner(value, row, index) {
        switch (value) {
            case 'Sitespeed (browsertime)':
                return '<img src="/design-system/static/assets/ico/sitespeed.png" width="20">'
            case 'Lighthouse':
            case 'Lighthouse-Nodejs':
                return '<img src="/design-system/static/assets/ico/lighthouse.png" width="20">'
            case 'Observer':
                return '<img src="/design-system/static/assets/ico/selenium.png" width="20">'
            default:
                return value
        }
    },
    actions(value, row, index) {
        return `
            <div class="d-flex justify-content-end">
                <a href="${ui_perf_url}&test_uid=${row.test_uid}"  id="test_view"><i class="fa fa-eye"></i></a>
            </div>
        `
    },
    name_style(value, row, index) {
        return {
            css: {
                "max-width": "140px",
                "overflow": "hidden",
                "text-overflow": "ellipsis",
                "white-space": "nowrap"
            }
        }
    },
}

var test_formatters = {
    job_type(value, row, index) {
        if (row.job_type === "perfmeter") {
            return '<img src="/design-system/static/assets/ico/jmeter.png" width="20">'
        } else if (row.job_type === "perfgun") {
            return '<img src="/design-system/static/assets/ico/gatling.png" width="20">'
        } else {
            return value
        }
    },

    actions(value, row, index) {
        return `
            <div class="d-flex justify-content-end">
                <a href="${backend_perf_url}&test_uid=${row.test_uid}"  id="test_view"><i class="fa fa-eye"></i></a>
            </div>
        `
    },
    name_style(value, row, index) {
        return {
            css: {
                "max-width": "140px",
                "overflow": "hidden",
                "text-overflow": "ellipsis",
                "white-space": "nowrap"
            }
        }
    },
    cell_style(value, row, index) {
        return {
            css: {
                "min-width": "165px"
            }
        }
    }
}

var tableFormatters = {
    reports_test_name_button(value, row, index) {
        console.log(security_results_url)
        return `<a href="${security_results_url}?result_id=${row.id}" role="button">${row.name}</a>`
    },
    reports_status_formatter(value, row, index) {
        switch (value.toLowerCase()) {
            case 'error':
            case 'failed':
                return `<div style="color: var(--red)">${value} <i class="fas fa-exclamation-circle error"></i></div>`
            case 'stopped':
                return `<div style="color: var(--yellow)">${value} <i class="fas fa-exclamation-triangle"></i></div>`
            case 'aborted':
                return `<div style="color: var(--gray)">${value} <i class="fas fa-times-circle"></i></div>`
            case 'finished':
                return `<div style="color: var(--info)">${value} <i class="fas fa-check-circle"></i></div>`
            case 'passed':
                return `<div style="color: var(--green)">${value} <i class="fas fa-check-circle"></i></div>`
            case 'pending...':
                return `<div style="color: var(--basic)">${value} <i class="fas fa-spinner fa-spin fa-secondary"></i></div>`
            default:
                return value
        }
    },
    tests_actions(value, row, index) {
        return `
            <div class="d-flex justify-content-end">
                <a href="${security_app_url}&test_uid=${row.test_uid}"  id="test_view"><i class="fa fa-eye"></i></a>
            </div>
        `
    },
    tests_tools(value, row, index) {
        // todo: fix
        return Object.keys(value?.scanners || {})
    },
    application_urls(value, row, index) {
        const enable_tooltip = JSON.stringify(value).length > 42  // because 42
        return `<div 
                    style="
                        max-width: 240px;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        overflow: hidden;
                    "
                    ${enable_tooltip && 'data-toggle="infotip"'}
                    data-placement="top" 
                    title='${value}'
                >${value}</div>`
    },
}

var apiActions = {
    base_url: api_name => `/api/v1/security/${api_name}/${getSelectedProjectId()}`,
    run: (id, name) => {
        fetch(`${apiActions.base_url('test')}/${id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'test_name': name})
        }).then(response => response.ok && apiActions.afterSave())
    },
    delete: ids => {
        const url = `${apiActions.base_url('tests')}?` + $.param({"id[]": ids})
        fetch(url, {
            method: 'DELETE'
        }).then(response => response.ok && apiActions.afterSave())
    },
    edit: (testUID, data) => {
        apiActions.beforeSave()
        fetch(`${apiActions.base_url('test')}/${testUID}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }).then(response => {
            apiActions.afterSave()
            if (response.ok) {
                securityModal.container.modal('hide');
            } else {
                response.json().then(data => securityModal.setValidationErrors(data))
            }
        })
    },
    editAndRun: (testUID, data) => {
        data['run_test'] = true
        return apiActions.edit(testUID, data)
    },
    create: data => {
        apiActions.beforeSave()
        fetch(apiActions.base_url('tests'), {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }).then(response => {
            apiActions.afterSave()
            if (response.ok) {
                $("#createApplicationTest").modal('hide');
            } else {
                response.json().then(data => securityModal.setValidationErrors(data))
            }
        })
    },
    createAndRun: data => {
        data['run_test'] = true
        return apiActions.create(data)
    },
    beforeSave: () => {
        $("#security_test_save").addClass("disabled updating")
        $("#security_test_save_and_run").addClass("disabled updating")
        securityModal.clearErrors()
        alertCreateTest?.clear()
    },
    afterSave: () => {
        $("#engagement_tests_table").bootstrapTable('refresh')
        $("#results_table").bootstrapTable('refresh')
        $("#security_test_save").removeClass("disabled updating")
        $("#security_test_save_and_run").removeClass("disabled updating")
    },
}


$(document).on('vue_init', () => {
    $('#delete_test').on('click', e => {
        const ids_to_delete = $(e.target).closest('.card').find('table.table').bootstrapTable('getSelections').map(
            item => item.id
        ).join(',')
        ids_to_delete && apiActions.delete(ids_to_delete)
    })
    $("#engagement_tests_table").on('all.bs.table', initTooltips)
    $(".switch-tabs").on('click', function(){
        activeTabId = `results-${this.id}`
        console.log(activeTabId)
        toggleTabs('results-card', activeTabId)
    })
})


function toggleTabs(className, activeTabId){
    $(`.${className}`).css('display', 'none');
    $(`#${activeTabId}`).css('display', 'block');
}
