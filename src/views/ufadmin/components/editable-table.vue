<template>
    <div>
        <Table :ref="refs" 
            border 
            stripe 
            disabled-hover
            :columns="columns"
            :data="thisTableData" ></Table>
    </div>
</template>

<script>

import Selector from './selector.vue';
import Vue from 'vue';
Vue.component('Selector', Selector);

const deleteButton = (vm, h, index) => {
    return h('Poptip', {
        props: {
            confirm: true,
            title: '您确定要删除这条数据吗?',
            transfer: true
        },
        on: {
            'on-ok': () => {
                vm.thisTableData.splice(index, 1);
                vm.$Message.success('删除成功');
                vm.$emit('input', vm.thisTableData);
            }
        }
    }, [
        h('Button', {
            props: {
                type: 'error',
                placement: 'top'
            }
        }, '删除')
    ]);
};

const cellInput = (vm, h, index, key) => {
    return h('Input', {
        props: {
            type: 'text',
            value: vm.thisTableData[index][key]
        },
        on: {
            'on-change' (event) {
                vm.tempValue = event.target.value;
            },
            'on-blur' () {
                vm.handleBackdata(index, key, vm.tempValue)
            },
            'on-focus' () {
                vm.tempValue = vm.thisTableData[index][key]
            }
        }
    });
};

const cellDatePicker = (vm, h, index, key) => {
    return h('DatePicker', {
        props: {
            type: 'date',
            transfer: true,
            value: vm.thisTableData[index][key],
            format: 'yyyy-MM-dd'
        },
        on: {
            'on-change' (val) {
                vm.handleBackdata(index, key, val)
            }
        }
    });
};

const cellSelector = (vm, h, index, key) => {
    return h('Selector', {
        props: {
            optionList: [{id:1,label:'111'}, {id:2,label:'2222'}],
            value: vm.thisTableData[index][key]
        },
        on: {
            'on-change' (val) {
                vm.handleBackdata(index, key, val)
            }
        }
    });
};


export default {
    name: 'editable-table',
    props: {
        refs: String,
        columns: Array,
        value: Array
    },
    data () {
        return {
            thisTableData: [],
            tempValue: '',
            keyCol: ''
        };
    },
    created () {
        this.init();
    },
    methods: {
        init () {
            let vm = this;
            this.thisTableData = JSON.parse(JSON.stringify(this.value));
            this.columns.forEach(item => {
                if(item.autoIncrement){
                    this.keyCol = item.key
                }

                item.render = (h, param) => {
                    const index = param.index
                    const key = item.key
                    if (item.handle) {
                        return deleteButton(this, h, index)
                    }
                    switch(item.type) {
                        case 'selector' : return cellSelector(this, h, index, key);
                        case 'text' : return cellInput(this, h, index, key);
                        case 'date' : return cellDatePicker(this, h, index, key);
                    }
                };
            });
        },
        handleBackdata (index, key, val) {
            this.thisTableData[index][key] = val
            if(this.keyCol == key
                && index == this.thisTableData.length - 1
                && typeof val != 'undefined'
                && val.length > 0){
                this.thisTableData.push({})
            }
            this.$emit('input', this.thisTableData)
        }
    },
    watch: {
        
    }
};
</script>
