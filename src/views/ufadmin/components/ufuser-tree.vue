<template>
    <Tree :data="data" :render="renderContent" ></Tree>
</template>
<script>
export default {
    name: 'ufuser-tree',
    props: {
        rootTitle: String,
        treeList: Array,
        value: Object
    },
    data () {
        return {
            data: [],
            buttonProps: {
                type: 'ghost',
                size: 'small',
            }
        }
    },
    methods: {
        renderContent (h, { root, node, data }) {
            const parentKey = root.find(el => el === node).parent;
            if(typeof parentKey === 'undefined'){
                return h('span', {
                    style: {
                        display: 'inline-block',
                        cursor: 'default'
                    }
                }, data.title)
            } else {
                return h('span', {
                    style: {
                        display: 'inline-block',
                        width: '100%'
                    }
                }, [
                    h('span', [
                        h('Icon', {
                            props: {
                                type: 'person'
                            },
                            style: {
                                marginRight: '8px'
                            }
                        }),
                        h('span', {
                            style:{
                                cursor: 'pointer'
                            },
                            on : {
                                click : () => { this.onSelectPerson(data) }
                            }
                        }, data.title)
                    ]),
                    h('span', {
                        style: {
                            display: 'inline-block',
                            float: 'right',
                            marginRight: '12px'
                        }
                    }, [
                    /*
                        h('Button', {
                            props: Object.assign({}, this.buttonProps, {
                                icon: 'ios-plus-empty'
                            }),
                            style: {
                                marginRight: '8px'
                            },
                            on: {
                                click: () => { this.append(data) }
                            }
                        }),*/
                        h('Button', {
                            props: Object.assign({}, this.buttonProps, {
                                icon: 'ios-minus-empty'
                            }),
                            on: {
                                click: () => { this.remove(root, node, data) }
                            }
                        })
                    ])
                ]);
            }
        },
        onSelectPerson (data) {
            console.log(data);
        },
        append (data) {
            const children = data.children || [];
            children.push({
                title: 'New Person-' + (children.length + 1),
                expand: true
            });
            this.$set(data, 'children', children);
        },
        remove (root, node, data) {
            this.$Modal.confirm({
                title: '删除记录',
                content: '<p>您确定要删除该条记录吗？</p>',
                okText: '删除',
                cancelText: '取消',
                onOk: () => {
                    const parentKey = root.find(el => el === node).parent;
                    const parent = root.find(el => el.nodeKey === parentKey).node;
                    const index = parent.children.indexOf(data);
                    parent.children.splice(index, 1);
                }
            });
            
        }
    },
    created () {
        this.data = [
            {
                title: this.rootTitle,
                expand: true,
                children: []
            }
        ]

        this.treeList.forEach(el => {
            this.data[0].children.push({
                title: el,
                selected: true,
                expand: true,
                render: (h, { root, node, data }) => {
                    return h('span', {
                        style: {
                            display: 'inline-block',
                            width: '100%',
                            cursor: 'default'
                        }
                    }, [
                        h('span', [
                            h('Icon', {
                                props: {
                                    type: 'person-stalker'
                                },
                                style: {
                                    marginRight: '8px'
                                }
                            }),
                            h('span', data.title)
                        ]),
                        h('span', {
                            style: {
                                display: 'inline-block',
                                float: 'right',
                                marginRight: '12px'
                            }
                        }, [
                            h('Button', {
                                props: Object.assign({}, this.buttonProps, {
                                    icon: 'ios-plus-empty',
                                    disabled: false,
                                    type: 'primary'
                                }),
                                on: {
                                    click: () => { this.append(data) }
                                }
                            })
                        ])
                    ]);
                }
            })
        })
    }
}
</script>