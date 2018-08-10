<style lang="less">
    @import './message.less';
</style>

<template>
    <div class="message-main-con">
        <Spin size="large" fix v-if="showSpin"></Spin>
        <div class="message-mainlist-con">
            <div>
                <Button @click="setCurrentMesType('unread')" size="large" long type="text"><transition name="mes-current-type-btn"><Icon v-show="currentMessageType === 'unread'" type="checkmark"></Icon></transition><span class="mes-type-btn-text">未读消息</span><Badge class="message-count-badge-outer" class-name="message-count-badge" :count="unreadCount"></Badge></Button>
            </div>
            <div>
                <Button @click="setCurrentMesType('hasread')" size="large" long type="text"><transition name="mes-current-type-btn"><Icon v-show="currentMessageType === 'hasread'" type="checkmark"></Icon></transition><span class="mes-type-btn-text">已读消息</span><Badge class="message-count-badge-outer" class-name="message-count-badge" :count="hasreadCount"></Badge></Button>
            </div>
            <div>
                <Button @click="setCurrentMesType('recyclebin')" size="large" long type="text"><transition name="mes-current-type-btn"><Icon v-show="currentMessageType === 'recyclebin'" type="checkmark"></Icon></transition><span class="mes-type-btn-text">回收站</span><Badge class="message-count-badge-outer" class-name="message-count-badge" :count="recyclebinCount"></Badge></Button>
            </div>
        </div>
        <div class="message-content-con">
            <transition name="view-message">
                <div v-if="showMesTitleList" class="message-title-list-con">
                    <Table ref="messageList" :columns="mesTitleColumns" :data="currentMesList" :no-data-text="noDataText"></Table>
                </div>
            </transition>
            <transition name="back-message-list">
                <div v-if="!showMesTitleList" class="message-view-content-con">
                    <div class="message-content-top-bar">
                        <span class="mes-back-btn-con">
                            <Button type="text" @click="backMesTitleList"><Icon type="chevron-left"></Icon>&nbsp;&nbsp;返回</Button>
                        </span>
                        <h3 class="mes-title">{{ mes.title }}</h3>
                        <span class="mes-front-btn-con">
                            <!-- 
                            <Button type="text" @click="markHasRead">已读&nbsp;&nbsp;<Icon type="checkmark-round"></Icon></Button>
                            -->
                        </span>
                    </div>
                    <p class="mes-time-con"><Icon type="android-time"></Icon>&nbsp;&nbsp;{{ mes.sendTime }}</p>
                    <div class="message-content-body">
                        <p class="message-content"><pre>{{ mes.content }}</pre></p>
                    </div>
                    <!-- 已删除消息无法评论
                    <div class="message-comment-input" v-if="mes.status < 2">
                        <Input v-model="comment" type="textarea" :rows="2" placeholder="Enter something..."></Input>
                        <Button type="primary" :disabled="!submitable" style="float: right;margin-top: 5px;" @click="submitComment()">提交</Button>
                    </div>
                     -->
                </div>
            </transition>
        </div>
    </div>
</template>

<script>

import Util from '@/libs/util';

export default {
    name: 'message_index',
    data () {
        const markAsreadBtn = (h, params) => {
            return h('Button', {
                props: {
                    size: 'small'
                },
                on: {
                    click: () => {
                        const msg = this.unreadMesList[params.index];
                        this.updateMsgStatus(msg.id, 1)
                        msg.status = 1;
                        this.hasreadMesList.unshift(this.unreadMesList.splice(params.index, 1)[0]);
                        this.$store.commit('setMessageCount', this.unreadMesList.length);
                    }
                }
            }, '标为已读');
        };
        const deleteMesBtn = (h, params) => {
            return h('Button', {
                props: {
                    size: 'small',
                    type: 'error'
                },
                on: {
                    click: () => {
                        // 当无评论时无法删除。

                        const msg = this.hasreadMesList[params.index];
                        msg.status = 2;
                        this.updateMsgStatus(msg.id, 2)
                        this.recyclebinList.unshift(this.hasreadMesList.splice(params.index, 1)[0]);
                    }
                }
            }, '删除');
        };
        const restoreBtn = (h, params) => {
            return h('Button', {
                props: {
                    size: 'small'
                },
                on: {
                    click: () => {
                        const msg = this.recyclebinList[params.index];
                        this.updateMsgStatus(msg.id, 1)
                        this.hasreadMesList.unshift(this.recyclebinList.splice(params.index, 1)[0]);
                    }
                }
            }, '还原');
        };
        return {
            showSpin : false,
            currentMesList: [],
            unreadMesList: [],
            hasreadMesList: [],
            recyclebinList: [],
            currentMessageType: 'unread',
            showMesTitleList: true,
            noDataText: '暂无未读消息',
            mes: {},
            comment: '',
            mesTitleColumns: [
                // {
                //     type: 'selection',
                //     width: 50,
                //     align: 'center'
                // },
                {
                    title: ' ',
                    key: 'title',
                    align: 'left',
                    ellipsis: true,
                    render: (h, params) => {
                        return h('a', {
                            on: {
                                click: () => {
                                    this.showMesTitleList = false;
                                    this.mes = params.row
                                    this.mes.sendTime = Util.formatDateTime(params.row.sendTime)
                                    // load comments
                                }
                            }
                        }, params.row.title);
                    }
                },
                {
                    title: ' ',
                    key: 'sendTime',
                    align: 'center',
                    width: 180,
                    render: (h, params) => {
                        return h('span', [
                            h('Icon', {
                                props: {
                                    type: 'android-time',
                                    size: 12
                                },
                                style: {
                                    margin: '0 5px'
                                }
                            }),
                            h('span', {
                                props: {
                                    type: 'android-time',
                                    size: 12
                                }
                            }, Util.formatDateTime(params.row.sendTime))
                        ]);
                    }
                },
                {
                    title: ' ',
                    key: 'hasread',
                    align: 'center',
                    width: 100,
                    render: (h, params) => {
                        if (this.currentMessageType === 'unread') {
                            return h('div', [
                                markAsreadBtn(h, params)
                            ]);
                        } else if (this.currentMessageType === 'hasread') {
                            return h('div', [
                                deleteMesBtn(h, params)
                            ]);
                        } else {
                            return h('div', [
                                restoreBtn(h, params)
                            ]);
                        }
                    }
                }
            ]
        };
    },
    methods: {
        updateMsgStatus(id, status){
            this.patchRequest('/message/internal', {id, status}).then(res => {
                const result = res.data;
                if(result.code === 0){
                    this.$Message.success('操作成功')
                } else {
                    this.$Message.error(result.msg)
                }
            })
        },
        backMesTitleList () {
            this.showMesTitleList = true;
        },
        markHasRead () {
            this.showMesTitleList = true;
        },
        setCurrentMesType (type) {
            if (this.currentMessageType !== type) {
                this.showMesTitleList = true;
            }
            this.currentMessageType = type;
            if (type === 'unread') {
                this.noDataText = '暂无未读消息';
                this.currentMesList = this.unreadMesList;
            } else if (type === 'hasread') {
                this.noDataText = '暂无已读消息';
                this.currentMesList = this.hasreadMesList;
            } else {
                this.noDataText = '回收站无消息';
                this.currentMesList = this.recyclebinList;
            }
        },
        submitComment() {
            if(this.mes.status === 0){
                this.updateMsgStatus(this.mes.id, 1)
                this.mes.status = 1;

                let removeIndex = -1
                this.unreadMesList.forEach((mes,index) => {
                    if(mes.id = this.mes.id){
                        removeIndex = index
                    }
                });

                if(removeIndex > -1){
                    this.unreadMesList.splice(removeIndex, 1)
                    this.hasreadMesList.push(this.mes)
                    this.$store.commit('setMessageCount', this.unreadMesList.length);
                }
            }

            console.log('submitComment:' + this.comment);
            this.comment = ''
        },
        getData(){
            this.showSpin = true
            this.unreadMesList = []
            this.hasreadMesList = []
            this.recyclebinList = []
            this.getRequest('/message/internal').then(res => {
                const result = res.data;
                if(result.code === 0){
                    const allMesList = result.data
                    allMesList.forEach(mes => {
                        switch(mes.status){
                            case 0 : this.unreadMesList.push(mes);
                                break;
                            case 1 : this.hasreadMesList.push(mes);
                                break;
                            case 2 : this.recyclebinList.push(mes);
                                break;
                            default: break;
                        }
                    })
                    this.currentMesList = this.unreadMesList
                    this.$store.commit('setMessageCount', this.unreadMesList.length);
                    this.showSpin = false
                }
            })
        }
    },
    mounted () {

    },
    computed: {
        unreadCount () {
            return this.unreadMesList.length;
        },
        hasreadCount () {
            return this.hasreadMesList.length;
        },
        recyclebinCount () {
            return this.recyclebinList.length;
        },
        submitable () {
            return this.comment.length > 0
        }
    },
    watch: {
    },
    activated () {
        this.getData()
    }
};
</script>

