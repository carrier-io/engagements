const EngagementBody = {
    props: ['engagement'],
    components: {
        'engagements-table': EngagementsTable,
        'engagements-card-container': EngagementCardContainer,
        'history-logs': HistoryLogs,
    },
    computed: {
        isDetail(){
            return this.engagement.id != -1;
        }
    },
    template: ` 
    <engagements-table
        v-show="!isDetail"
        :engagement="engagement"
    >
    </engagements-table>
    <engagement-card-container
        v-if="isDetail"
        :engagement="engagement"
    ></engagement-card-container>
    <history-logs
        v-if="isDetail"
        :engagement="engagement"
    ></history-logs>
    `
};


register_component('engagement-body', EngagementBody);