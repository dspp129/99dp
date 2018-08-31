<template>
    <Row>
        <Col span="6">
            <Card>
                <Tree :data="root" :render="renderContent" ></Tree>
            </Card>
        </Col>

        <Col span="18">
            <Card class="margin-left-10" :title="rightTitle">

                <div class="margin-top-10">
                    <span class="span-label-middle">姓　　名</span>
                    <span class="span-value-short">
                        <Input v-model="userInfo.title" />
                    </span>
                    <span class="span-label-middle">与本人关系</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                    <span class="span-label-middle">出生日期</span>
                    <span class="span-value-short">
                        <DatePicker type="date" v-model="userInfo.birthday" transfer />
                    </span>
                </div>
                <div class="margin-top-10">
                    <span class="span-label-middle">籍　　贯</span>
                    <span class="span-value-short">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-middle">民　　族</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                    <span class="span-label-middle">政治面貌</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                </div>
                <div class="margin-top-10">
                    <span class="span-label-middle">国　　籍</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                    <span class="span-label-middle">学　　历</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                    <span class="span-label-middle">健康情况</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-auto">是否取得国(境)外永久居留权</span>
                    <span class="span-value-auto">
                        <Checkbox v-model="userInfo.checkbox"></Checkbox>
                    </span>
                    <span class="span-label-auto">取得国(境)外永久居留权国家(地区)名称</span>
                    <span class="span-value-auto" style="width: 172px;">
                        <Input v-model="userInfo.chushengdi" />
                    </span>
                </div>
                <div class="margin-top-10">
                    <span class="span-label-middle">离开大陆时间</span>
                    <span class="span-value-short">
                        <DatePicker type="date" v-model="userInfo.birthday" transfer />
                    </span>
                </div>


                <div class="margin-top-10">
                    <span class="span-label-long">工作单位及职务</span>
                    <span class="span-value-auto" style="width: 318px;">
                        <Input v-model="userInfo.chushengdi" />
                    </span>
                    <span class="span-label-middle">参加工作时间</span>
                    <span class="span-value-short">
                        <DatePicker type="date" v-model="userInfo.birthday" transfer />
                    </span>
                </div>


                <div class="margin-top-10">
                    <span class="span-label-middle">是否社会名人</span>
                    <span class="span-value-auto">
                        <Checkbox v-model="userInfo.checkbox"></Checkbox>
                    </span>
                    <span class="span-label-middle">社会名人情况</span>
                    <span class="span-value-auto" style="width: 172px;">
                        <Input v-model="userInfo.chushengdi" type="textarea" style="width: 426px;" :autosize="{minRows: 2}"/>
                    </span>
                </div>

            </Card>
        </Col>
    </Row>
</template>
<script>
export default {
    name: 'family-member-tree',
    props: {
        value: Array
    },
    data () {
        return {
            root: [],

            rootTitle: '所有人员',
            rightTitle: '家庭成员',
            treeList: ['家庭成员','社会成员'],

            userInfo: {},  // should be one of the members

            buttonProps: {
                type: 'ghost',
                size: 'small'
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
                            props: { type: 'person' },
                            style: { marginRight: '8px'}
                        }),
                        h('span', {
                            style:{ cursor: 'pointer' },
                            class: ['ivu-tree-title', data.selected?'ivu-tree-title-selected':''],
                            on : { click : () => { this.onClick(root, node, data) } }
                        }, data.title)
                    ]),
                    h('span', 
                        {
                            style: {
                                display: 'inline-block',
                                float: 'right',
                                marginRight: '12px'
                            }
                        }, 
                        [h('Button', {
                            props: Object.assign({}, this.buttonProps, {
                                icon: 'ios-minus-empty'
                            }),
                            on: {
                                click: () => { this.remove(root, node, data) }
                            }
                        })]
                    )
                ]);
            }
        },
        onClick (root, node, data) {
            this.rightTitle = data.parent;
            if(data.selected) return;
            root.forEach(el => { el.node.selected = false })
            data.selected = true
            this.userInfo = data
        },
        append (parentNode) {
            const children = parentNode.children || [];
            children.push({
                title: '新建' + parentNode.title + '-' + (children.length + 1),
                selected: false,
                parent: parentNode.title
            });
            this.$set(parentNode, 'children', children);
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
                    if(data.selected) this.userInfo = {}
                }
            });
        }
    },
    created () {
        this.root = [
            {
                title: this.rootTitle,
                expand: true,
                children: []
            }
        ]

        this.treeList.forEach(el => {
            this.root[0].children.push({
                title: el,
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
                                props: { type: 'person-stalker' },
                                style: { marginRight: '8px' }
                            }),
                            h('span', { class : 'ivu-tree-title' }, data.title)
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