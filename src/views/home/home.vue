<style lang="less">
    @import "./home.less";
    @import "../../styles/common.less";
</style>
<template>
    <div class="home-main">
        <Row :gutter="10">
            <Col :md="24" :lg="8">
                <Row class-name="home-page-row1" :gutter="10">
                    <Col :md="12" :lg="24" :style="{marginBottom: '10px'}">
                        <Card>
                            <Row type="flex" class="user-infor">
                                <Col span="8">
                                    <Row class-name="made-child-con-middle" type="flex" align="middle">
                                        <img class="avator-img" :src="avatorPath" />
                                    </Row>
                                </Col>
                                <Col span="16" style="padding-left:6px;">
                                    <Row class-name="made-child-con-middle" type="flex" align="middle">
                                        <div>
                                            <b class="card-user-infor-name">{{userName}}</b>
                                            <p>super admin</p>
                                        </div>
                                    </Row>
                                </Col>
                            </Row>
                            <div class="line-gray"></div>
                            <Row class="margin-top-8">
                                <Col span="8"><p class="notwrap">上次登录时间:</p></Col>
                                <Col span="16" class="padding-left-8">{{lastLoginTime}}</Col>
                            </Row>
                            <Row class="margin-top-8">
                                <Col span="8"><p class="notwrap">上次登录地点:</p></Col>
                                <Col span="16" class="padding-left-8">上海</Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col :md="12" :lg="24" :style="{marginBottom: '10px'}">
                        <Card icon="android-checkbox-outline" title="待办事项">
                            <a type="text" slot="extra" @click.prevent="addNewToDoItem">
                                <Icon type="plus-round"></Icon>
                            </a>
                            <Modal
                                v-model="showAddNewTodo"
                                title="添加新的待办事项"
                                @on-ok="addNew"
                                @on-cancel="cancelAdd">
                                <Row type="flex" justify="center">
                                    <Input v-model="newToDoItemValue" icon="compose" placeholder="请输入..." style="width: 300px" />
                                </Row>
                                <Row type="flex" justify="center">

                                </Row>
                                <Row slot="footer">
                                    <Button type="text" @click="cancelAdd">取消</Button>
                                    <Button type="primary" @click="addNew">确定</Button>
                                </Row>
                            </Modal>
                            <div class="to-do-list-con">
                                <div v-for="(item, index) in toDoList" :key="'todo-item' + (toDoList.length - index)" class="to-do-item">
                                    <to-do-list-item :content="item.title" :id="item.id" @on-toggle="onToggleItem" @on-edit="onEditItem"></to-do-list-item>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col :md="12" :lg="24" :style="{marginBottom: '10px'}">
                        <Card icon="android-map" title="上周每日来访量统计">
                            <div class="data-source-row">
                                <visite-volume></visite-volume>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Col>
            <Col :md="24" :lg="16">
                <Row :gutter="5">
                    <Col :xs="24" :sm="12" :md="6" >
                        <a @click="jumpToPage('table')">
                            <infor-card
                                id-name="transfer_count"
                                :end-val="count.newTable"
                                iconType="ios-grid-view"
                                color="#f25e43"
                                intro-text="今日新增表结构"
                            ></infor-card>
                        </a>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" >
                        <a @click="jumpToPage('task')">
                            <infor-card
                                id-name="user_created_count"
                                :end-val="count.newTask"
                                iconType="network"
                                color="#2d8cf0"
                                intro-text="今日新增任务"
                            ></infor-card>
                        </a>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" >
                        <a @click="jumpToPage('report-auto')">
                            <infor-card
                                id-name="collection_count"
                                :end-val="count.newReport"
                                iconType="pie-graph"
                                color="#ffd572"
                                intro-text="今日新增报表"
                            ></infor-card>
                        </a>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" >
                        <a @click="jumpToPage('monitor')">
                            <infor-card
                                id-name="visit_count"
                                :end-val="count.successRecord"
                                iconType="checkmark-round"
                                color="#64d572"
                                :iconSize="50"
                                intro-text="今日成功调度"
                            ></infor-card>
                        </a>
                    </Col>
                </Row>
                <Row :gutter="10" class="margin-top-10">
                    <Col :md="24" :lg="12" :style="{marginBottom: '10px'}">
                        <Card icon="ios-pulse-strong" title="调度成功率">
                            <div class="data-source-row">
                                <data-source-pie :success="count.successRecord" :failure="count.failureRecord"></data-source-pie>
                            </div>
                        </Card>

                    </Col>
                    <Col :md="24" :lg="12">
                        <Card icon="android-wifi" title="数据质量成功率">
                            <div class="data-source-row">
                                <data-source-pie :success="123" :failure="23"></data-source-pie>
                            </div>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Card :padding="0" icon="map" title="今日服务调用地理分布">
                        <div class="map-con">
                            <Col span="10">
                                <map-data-table :cityData="cityData" height="281" :style-obj="{margin: '12px 0 0 11px'}"></map-data-table>
                            </Col>
                            <Col span="14" class="map-incon">
                                <Row type="flex" justify="center" align="middle">
                                    <home-map :city-data="cityData"></home-map>
                                </Row>
                            </Col>
                        </div>
                    </Card>
                </Row>
            </Col>
        </Row>

        <Row class="margin-top-10">
            <Card icon="ios-shuffle-strong" title="上周每日服务调用量(万)">
                <div class="line-chart-con">
                    <service-requests></service-requests>
                </div>
            </Card>
        </Row>
    </div>
</template>

<script>
import cityData from './map-data/get-city-value.js';
import homeMap from './components/map.vue';
import dataSourcePie from './components/dataSourcePie.vue';
import visiteVolume from './components/visiteVolume.vue';
import serviceRequests from './components/serviceRequests.vue';
import userFlow from './components/userFlow.vue';
import countUp from './components/countUp.vue';
import inforCard from './components/inforCard.vue';
import mapDataTable from './components/mapDataTable.vue';
import toDoListItem from './components/toDoListItem.vue';
import Cookies from 'js-cookie';

export default {
    name: 'home',
    components: {
        homeMap,
        dataSourcePie,
        visiteVolume,
        serviceRequests,
        userFlow,
        countUp,
        inforCard,
        mapDataTable,
        toDoListItem
    },
    data () {
        return {
            toDoList: [
                {
                    id:1,
                    title: '去流程中心完成流程BPM00126975'
                },
                {
                    id:2,
                    title: '整理Tableau学习资料，并分享'
                },
                {
                    id:3,
                    title: 'MyCat数据抽取分享（全量+增量）'
                },
                {
                    id:4,
                    title: '迁移ETL至新平台，完善知识库'
                },
                {
                    id:5,
                    title: '去iView官网学习完整的iView组件'
                }
            ],
            count: {
                newTask: 0,
                newReport: 0,
                newTable: 0,
                successRecord: 0,
                failureRecord: 0,
                successQuality: 0,
                failureQuality: 0
            },
            cityData: cityData,
            showAddNewTodo: false,
            newToDoItemValue: '',
            userName: '',
            lastLoginTime: ''
        };
    },
    computed: {
        avatorPath () {
            return localStorage.avatorImgPath;
        }
    },
    methods: {
        init () {

            const time = Cookies.get('lastLoginTime')
            const date = new Date(parseInt(time))
            this.lastLoginTime = this.dateTimeFormat(date)
            this.userName = Cookies.get('trueName')

            this.getRequest('/home/homePage').then(res =>{
                const result = res.data
                if(result.code === 0){
                    this.count = result.data
                }
            })
        },
        addNewToDoItem () {
            this.showAddNewTodo = true;
        },
        addNew () {
            if (this.newToDoItemValue.length !== 0) {
                this.toDoList.unshift({
                    title: this.newToDoItemValue
                });
                setTimeout(() => {
                    this.newToDoItemValue = '';
                }, 200);
                this.showAddNewTodo = false;
            } else {
                this.$Message.error('请输入待办事项内容');
            }
        },
        cancelAdd () {
            this.showAddNewTodo = false;
            this.newToDoItemValue = '';
        },
        onEditItem () {
            console.log('edit item');
        },
        onToggleItem () {
            console.log('toggle item');
        },
        jumpToPage(name){
            let path = ''
            switch(name){
                case 'table' : path = '/metadata/table'; break;
                case 'task' : path = '/scheduler/task-list'; break;
                case 'report-auto' : path = '/scheduler/report-auto-list'; break;
                case 'monitor' : path = '/scheduler/monitor-list'; break;
            }

            this.$router.push({ path });
        }
    },
    mounted () {
        this.init();
    }
};
</script>
