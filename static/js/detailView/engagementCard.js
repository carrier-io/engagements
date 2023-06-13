const EngagementCardContainer = {
    props: ["engagement"],
    emits: ['updated'],
    components: {
        'header-container': EngagementHeaderContainer,
        'description-container': EngagementDetailContainer,
        'attachments-container': EngagementAttachmentsContainer,
    },
    methods: {
        fireEvent(payload){
            // Create a new custom event
            const customEvent = new CustomEvent('updateEngagement', {
                detail: payload,
            });
            
            // Dispatch the custom event
            document.dispatchEvent(customEvent);
        },

        propagateEvent(data){
            newEngagement = {...this.engagement}
            Object.assign(newEngagement, data)
            this.fireEvent(newEngagement)
        },
        close(){
            this.$emit('updated', null)
        },
    },
    template: `
        <div class="card mt-3" style="margin: 0px">
            <div class="card-body" style="padding: 0px">
                <div class="ticket-view">
                    
                    <header-container
                        :engagement="engagement"
                        @updated="propagateEvent"
                        @close="close"
                    ></header-container>

                    <description-container
                        :engagement=engagement
                        @updated="propagateEvent"
                    >
                    </description-container>
                
                    <attachments-container
                        :engagement=engagement
                    >
                    </attachments-container>
                </div>
            </div>
        </div>
    `
}

register_component('engagement-card-container', EngagementCardContainer);