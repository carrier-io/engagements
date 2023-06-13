const EngagementBody = {
    props: ['engagement'],
    components: {
        'engagements-table': EngagementsTable,
        'engagements-card-container': EngagementCardContainer,
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
    `
};


register_component('engagement-body', EngagementBody);