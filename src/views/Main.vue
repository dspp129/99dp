<style lang="less">
    @import "./main.less";
</style>
<template>
    <div class="main" :class="{'main-hide-text': shrink}">
        <div class="sidebar-menu-con" :style="{width: shrink?'60px':'200px', overflow: shrink ? 'visible' : 'auto'}">
            <shrinkable-menu 
                :shrink="shrink"
                @on-change="handleSubmenuChange"
                :theme="menuTheme" 
                :before-push="beforePush"
                :open-names="openedSubmenuArr"
                :menu-list="menuList">
                <div slot="top" class="logo-con">
                    <img v-show="!shrink"  src="../images/logo.png" key="max-logo" />
                    <img v-show="shrink" src="../images/logo-min.jpg" key="min-logo" />
                </div>
            </shrinkable-menu>
        </div>
        <div class="main-header-con" :style="{paddingLeft: shrink?'60px':'200px'}">
            <div class="main-header">
                <div class="navicon-con">
                    <Button :style="{transform: 'rotateZ(' + (this.shrink ? '-90' : '0') + 'deg)'}" type="text" @click="toggleClick">
                        <Icon type="navicon" size="32"></Icon>
                    </Button>
                </div>
                <div class="header-middle-con">
                    <div class="main-breadcrumb">
                        <breadcrumb-nav :currentPath="currentPath"></breadcrumb-nav>
                    </div>
                </div>
                <div class="header-avator-con">
                    <full-screen v-model="isFullScreen" @on-change="fullscreenChange"></full-screen>
                <!--    <lock-screen></lock-screen>    -->
                    <variable-explaination></variable-explaination>
                    <message-tip v-model="mesCount"></message-tip>
                    <theme-switch></theme-switch>
                    <div class="user-dropdown-menu-con">
                        <Row type="flex" justify="end" align="middle" class="user-dropdown-innercon">
                            <Dropdown transfer trigger="click" @on-click="handleClickUserDropdown">
                                <a href="javascript:void(0)">
                                    <span class="main-user-name">{{ userName }}&nbsp;</span>
                                    <Icon type="arrow-down-b"></Icon>
                                </a>
                                <DropdownMenu slot="list">
                                    <DropdownItem name="ownSpace">个人中心</DropdownItem>
                                    <DropdownItem name="changePwd">修改密码</DropdownItem>
                                    <DropdownItem name="loginout" divided>退出登录</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <Avatar :src="avatorPath" style="background: #f8f8f9;margin-left: 10px;"></Avatar>
                        </Row>
                    </div>
                </div>
            </div>
            <div class="tags-con">
                <tags-page-opened :pageTagsList="pageTagsList"></tags-page-opened>
            </div>
        </div>
        <div class="single-page-con" :style="{left: shrink?'60px':'200px'}">
            <div class="single-page">
                <keep-alive :include="cachePage">
                    <router-view></router-view>
                </keep-alive>
                <!-- Footer>2017 - 2018 &copy; 99DataPlatform</Footer -->
            </div>
        </div>
        <Modal v-model="editPasswordModal" :closable='false' :mask-closable=false :width="500" class-name="modal-vertical-center">
            <h3 slot="header" style="color:#2D8CF0">修改密码</h3>
            <Form ref="editPasswordForm" :model="editPasswordForm" :label-width="150" label-position="right" :rules="passwordValidate">
                <FormItem label="原密码" prop="oldPass" :error="oldPassError" class="margin-top-10">
                    <div class="password-con">
                        <Input v-model="editPasswordForm.oldPass" placeholder="请输入现在使用的密码" type="password"></Input>
                    </div>
                </FormItem>
                <FormItem label="新密码" prop="newPass">
                    <div class="password-con">
                        <Input v-model="editPasswordForm.newPass" placeholder="请输入新密码，至少6位字符" type="password"></Input>
                    </div>
                </FormItem>
                <FormItem label="确认新密码" prop="rePass">
                    <div class="password-con">
                        <Input v-model="editPasswordForm.rePass" placeholder="请再次输入新密码" type="password"></Input>
                    </div>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancelEditPassword">取消</Button>
                <Button type="primary" :loading="savePassLoading" @click="saveEditPassword">保存</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import shrinkableMenu from './main-components/shrinkable-menu/shrinkable-menu.vue';
    import tagsPageOpened from './main-components/tags-page-opened.vue';
    import breadcrumbNav from './main-components/breadcrumb-nav.vue';
    import variableExplaination from './main-components/variable-explaination.vue';
    import fullScreen from './main-components/fullscreen.vue';
    import lockScreen from './main-components/lockscreen/lockscreen.vue';
    import messageTip from './main-components/message-tip.vue';
    import themeSwitch from './main-components/theme-switch/theme-switch.vue';
    import Cookies from 'js-cookie';
    import util from '@/libs/util.js';
    import md5 from 'js-md5';
    
    export default {
        components: {
            shrinkableMenu,
            tagsPageOpened,
            breadcrumbNav,
            variableExplaination,
            fullScreen,
            lockScreen,
            messageTip,
            themeSwitch
        },
        data () {
            const valideRePassword = (rule, value, callback) => {
                if (value !== this.editPasswordForm.newPass) {
                    callback(new Error('两次输入密码不一致'));
                } else {
                    callback();
                }
            };
            return {
                shrink: false,
                userName: '',
                isFullScreen: false,
                openedSubmenuArr: this.$store.state.app.openedSubmenuArr,

                editPasswordModal: false, // 修改密码模态框显示
                savePassLoading: false,
                oldPassError: '',
                editPasswordForm: {
                    oldPass: '',
                    newPass: '',
                    rePass: ''
                },
                passwordValidate: {
                    oldPass: [
                        { required: true, message: '请输入原密码', trigger: 'blur' }
                    ],
                    newPass: [
                        { required: true, message: '请输入新密码', trigger: 'blur' },
                        { min: 6, message: '请至少输入6个字符', trigger: 'blur' },
                        { max: 32, message: '最多输入32个字符', trigger: 'blur' }
                    ],
                    rePass: [
                        { required: true, message: '请再次输入新密码', trigger: 'blur' },
                        { validator: valideRePassword, trigger: 'blur' }
                    ]
                },
            };
        },
        computed: {
            menuList () {
                return this.$store.state.app.menuList;
            },
            pageTagsList () {
                return this.$store.state.app.pageOpenedList; // 打开的页面的页面对象
            },
            currentPath () {
                return this.$store.state.app.currentPath; // 当前面包屑数组
            },
            avatorPath () {
                return localStorage.avatorImgPath;
            },
            cachePage () {
                return this.$store.state.app.cachePage;
            },
            lang () {
                return this.$store.state.app.lang;
            },
            menuTheme () {
                return this.$store.state.app.menuTheme;
            },
            mesCount () {
                return this.$store.state.app.messageCount;
            }
        },
        methods: {
            init () {
                let pathArr = util.setCurrentPath(this, this.$route.name);
                this.$store.commit('updateMenulist');
                if (pathArr.length >= 2) {
                    this.$store.commit('addOpenSubmenu', pathArr[1].name);
                }
                this.userName = Cookies.get('trueName');
                this.checkTag(this.$route.name);
                this.countUnreadMsg()
            },
            countUnreadMsg () {
                let pollId = setInterval(() => {
                    if(!util.checkUnreadMessage(this)){
                        clearInterval(pollId);
                        // this.$store.commit('setMessageCount', 0);
                    }
                }, 1000 * 60 * 1); // 每隔1分钟刷新未读信息
            },
            toggleClick () {
                this.shrink = !this.shrink;
            },
            handleClickUserDropdown (name) {
                if (name === 'ownSpace') {
                    this.$router.push({
                        name: 'ownspace_index'
                    });
                } else if (name === 'changePwd') {
                    this.showEditPassword()
                } else if (name === 'loginout') {
                    // 退出登录
                    this.getRequest('/user/logout').then(res =>{
                        if(res.data.code === 0){
                            this.$Message.success('退出成功！')
                            this.$store.commit('logout', this);
                            this.$store.commit('clearAllTags');
                            // this.$store.commit('clearOpenedSubmenu');
                            this.$router.push({
                                name: 'login'
                            });
                        }
                    })
                }
            },
            checkTag (name) {
                let openpageHasTag = this.pageTagsList.some(item => {
                    if (item.name === name) {
                        return true;
                    }
                });
                if (!openpageHasTag) { //  解决关闭当前标签后再点击回退按钮会退到当前页时没有标签的问题
                    util.openNewPage(this, name, this.$route.params || {}, this.$route.query || {});
                }
            },
            handleSubmenuChange (val) {
                // console.log(val)
            },
            beforePush (name) {
                // if (name === 'accesstest_index') {
                //     return false;
                // } else {
                //     return true;
                // }
                return true;
            },
            fullscreenChange (isFullScreen) {
                // console.log(isFullScreen);
            },
            showEditPassword () {
                this.savePassLoading = false;
                this.editPasswordModal = true;
            },
            cancelEditPassword () {
                this.editPasswordModal = false;
                this.$refs['editPasswordForm'].resetFields();
                this.savePassLoading = false;
            },
            saveEditPassword () {
                this.$refs['editPasswordForm'].validate((valid) => {
                    if (valid) {
                        this.$Loading.start();
                        this.savePassLoading = true;
                        setTimeout(() => {
                            const password = md5(this.editPasswordForm.oldPass)
                            const newPassword = md5(this.editPasswordForm.newPass)
                            this.patchRequest('/user/changePwd',{password,newPassword}).then(res=>{
                                const result = res.data;
                                if(result.code === 0){
                                    this.$Loading.finish();
                                    this.$Message.success('保存成功');
                                    this.cancelEditPassword()
                                } else {
                                    this.$Loading.error();
                                    this.$Message.error(result.msg);
                                }
                                this.savePassLoading = false;
                            })
                        }, 1000);
                    }
                });
            },
        },
        watch: {
            '$route' (to) {
                this.$store.commit('setCurrentPageName', to.name);
                let pathArr = util.setCurrentPath(this, to.name);
                if (pathArr.length > 2) {
                    this.$store.commit('addOpenSubmenu', pathArr[1].name);
                }
                this.checkTag(to.name);
                localStorage.currentPageName = to.name;
            },
            lang () {
                util.setCurrentPath(this, this.$route.name); // 在切换语言时用于刷新面包屑
            }
        },
        mounted () {
            this.init();
        },
        created () {
            // 显示打开的页面的列表
            this.$store.commit('setOpenedList');
        }
    };
</script>
