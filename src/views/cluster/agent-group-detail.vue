<template>
    <Card icon="social-buffer" title="组详情">


        <Transfer
            :data="data"
            :target-keys="targetKeys"
            :list-style="listStyle"
            :render-format="render"
            filterable
            @on-change="handleChange">
            <div :style="{float: 'right', margin: '5px'}">
                <Button type="ghost" size="small" @click="reloadMockData">上一页</Button>
                <Button type="ghost" size="small" @click="reloadMockData">刷新</Button>
                <Button type="ghost" size="small" @click="reloadMockData">下一页</Button>
            </div>
        </Transfer>
    </Card>
</template>

<script>
export default {
    name: 'agent-group-detail',

    data () {
        return {
            data: this.getMockData(),
            targetKeys: this.getTargetKeys(),
            listStyle: {
                width: '250px',
                height: '300px'
            }
        }
    },
    methods: {
        getMockData () {
            let mockData = [];
            for (let i = 1; i <= 20; i++) {
                mockData.push({
                    key: i.toString(),
                    label: 'Content ' + i,
                    description: 'The desc of content  ' + i,
                    disabled: Math.random() * 3 < 1
                });
            }
            return mockData;
        },
        getTargetKeys () {
            return this.getMockData()
                    .filter(() => Math.random() * 2 > 1)
                    .map(item => item.key);
        },
        handleChange (newTargetKeys) {
            this.targetKeys3 = newTargetKeys;
        },
        render (item) {
            return item.label + ' - ' + item.description;
        },
        reloadMockData () {
            this.data = this.getMockData();
            this.targetKeys = this.getTargetKeys();
        }
    }
}
</script>