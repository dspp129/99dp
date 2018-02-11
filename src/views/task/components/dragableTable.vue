<template>
    <div>
        <Table 
            ref="dragable" 
            :columns="columns" 
            :data="value" 
            :loading="loading"
            @on-selection-change="onSelectionChange"
            @on-sort-change="onSortChange"
            highlight-row
            border
            stripe
            size="small"
        ></Table>
    </div>
</template>

<script>
import Sortable from 'sortablejs';

export default {
    name: 'DragableTable',
    props: {
        columns: Array,
        value: Array,
        loading: Boolean
    },
    methods: {
        startFunc (e) {
            this.$emit('on-start', e.oldIndex);
        },
        endFunc (e) {
            let movedRow = this.value[e.oldIndex];
            this.value.splice(e.oldIndex, 1);
            this.value.splice(e.newIndex, 0, movedRow);
            this.$emit('on-end', {
                value: this.value,
                from: e.oldIndex,
                to: e.newIndex
            });
        },
        chooseFunc (e) {
            this.$emit('on-choose', e.oldIndex);
        },
        onSelectionChange(e){
            const selected = e.map(row => row.columnName)
            this.value.map((row,index) => {
                const isChecked = selected.includes(row.columnName)
                if(row._checked !== isChecked){
                    row._checked = isChecked
                    this.value.splice(index, 1);
                    this.value.splice(index, 0, row);
                }
            })
        },
        onSortChange(e){
            this.value.sort((a,b)=>{
                return e.order === 'desc' ? b.columnName.localeCompare(a.columnName) : a.columnName.localeCompare(b.columnName)
            })
        }
    },
    mounted () {
        var el = this.$refs.dragable.$children[1].$el.children[1];
        let vm = this;
        Sortable.create(el, {
            onStart: vm.startFunc,
            onEnd: vm.endFunc,
            onChoose: vm.chooseFunc
        });
    },
    watch : {
        value(value){}
    }
};
</script>

