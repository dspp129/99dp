<style lang="less">
    @import './own-space.less';
</style>

<template>
    <div>
        <Card icon="person" title="个人信息">
            <Form 
                ref="userForm"
                :model="userForm" 
                :label-width="150" 
                label-position="right"
                :rules="inforValidate"
            >
                <FormItem label="用户名">
                    <span>{{ userForm.username }}</span>
                </FormItem>
                <FormItem label="真实姓名" prop="trueName">
                    <div style="display:inline-block;width:204px;">
                        <Input v-model="userForm.trueName" ></Input>
                    </div>
                </FormItem>
                <FormItem label="手机" prop="mobile" >
                    <div style="display:inline-block;width:204px;">
                        <Input v-model="userForm.mobile" @on-keydown="hasChangePhone"></Input>
                    </div>
                    <!--
                    <div style="display:inline-block;position:relative;">
                        <Button @click="getIdentifyCode" :disabled="canGetIdentifyCode">{{ gettingIdentifyCodeBtnContent }}</Button>
                        <div class="own-space-input-identifycode-con" v-if="inputCodeVisible">
                            <div style="background-color:white;z-index:110;margin:10px;">
                                <Input v-model="securityCode" placeholder="请填写短信验证码" ></Input>
                                <div style="margin-top:10px;text-align:right">
                                    <Button type="ghost" @click="cancelInputCodeBox">取消</Button>
                                    <Button type="primary" @click="submitCode" :loading="checkIdentifyCodeLoading">确定</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    -->
                </FormItem>
                <FormItem label="邮箱" prop="email" >
                    <div style="display:inline-block;width:204px;">
                        <Input v-model="userForm.email"></Input>
                    </div>
                </FormItem>
                <FormItem label="公司">
                    <span>{{ userForm.company }}</span>
                </FormItem>
                <FormItem label="部门">
                    <span>{{ userForm.department }}</span>
                </FormItem>
                <div>
                    <Button type="text" style="width: 100px;" @click="cancelEditUserInfor">取消</Button>
                    <Button type="primary" style="width: 100px;" :loading="save_loading" @click="saveEdit">保存</Button>
                </div>
            </Form>
        </Card>
    </div>
</template>

<script>

export default {
    name: 'ownspace_index',
    data () {
        const validePhone = (rule, value, callback) => {
            var re = /^1[0-9]{10}$/;
            if (!re.test(value)) {
                callback(new Error('请输入正确格式的手机号'));
            } else {
                callback();
            }
        };
        return {
            userForm: {
                username: '',
                trueName: '',
                mobile: '',
                email: '',
                company: '',
                department: ''
            },
            uid: '', // 登录用户的userId
            securityCode: '', // 验证码
            phoneHasChanged: false, // 是否编辑了手机
            save_loading: false,
            identifyError: '', // 验证码错误
            identifyCodeRight: false, // 验证码是否正确
            hasGetIdentifyCode: false, // 是否点了获取验证码
            canGetIdentifyCode: false, // 是否可点获取验证码
            checkIdentifyCodeLoading: false,
            inforValidate: {
                trueName: [
                    { required: true, message: '请输入姓名', trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机号码' },
                    { validator: validePhone }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' }
                ]
            },
            inputCodeVisible: false, // 显示填写验证码box
            initPhone: '',
            gettingIdentifyCodeBtnContent: '获取验证码' // “获取验证码”按钮的文字
        };
    },
    methods: {
        getIdentifyCode () {
            this.hasGetIdentifyCode = true;
            this.$refs['userForm'].validate((valid) => {
                if (valid) {
                    this.canGetIdentifyCode = true;
                    let timeLast = 60;
                    let timer = setInterval(() => {
                        if (timeLast >= 0) {
                            this.gettingIdentifyCodeBtnContent = timeLast + '秒后重试';
                            timeLast -= 1;
                        } else {
                            clearInterval(timer);
                            this.gettingIdentifyCodeBtnContent = '获取验证码';
                            this.canGetIdentifyCode = false;
                        }
                    }, 1000);
                    this.inputCodeVisible = true;
                    // you can write ajax request here
                }
            });
        },
        cancelEditUserInfor () {
            this.$store.commit('removeTag', 'ownspace_index');
            localStorage.pageOpenedList = JSON.stringify(this.$store.state.app.pageOpenedList);
            let lastPageName = '';
            if (this.$store.state.app.pageOpenedList.length > 1) {
                lastPageName = this.$store.state.app.pageOpenedList[1].name;
            } else {
                lastPageName = this.$store.state.app.pageOpenedList[0].name;
            }
            this.$router.push({
                name: lastPageName
            });
        },
        saveEdit () {
            this.$refs['userForm'].validate((valid) => {
                if (valid) {
                    /*
                    if (this.phoneHasChanged && this.userForm.mobile !== this.initPhone) {
                        // 手机号码修改过了而且修改之后的手机号和原来的不一样
                        if (this.hasGetIdentifyCode) { // 判断是否点了获取验证码
                            if (this.identifyCodeRight) { // 判断验证码是否正确
                                this.saveInfoAjax();
                            } else {
                                this.$Message.error('验证码错误，请重新输入');
                            }
                        } else {
                            this.$Message.warning('请先点击获取验证码');
                        }
                    } else {
                        this.saveInfoAjax();
                    }
                    */
                    this.saveInfoAjax();
                }
            });
        },
        init () {
            this.getRequest('/user/info').then(res=>{
                const result = res.data;
                if(result.code === 0){
                    const userInfo = result.data;
                    this.userForm.username = userInfo.username;
                    this.userForm.trueName = userInfo.trueName;
                    this.userForm.mobile = userInfo.mobile;
                    this.userForm.email = userInfo.email;
                    this.initPhone = userInfo.mobile;
                    this.userForm.company = '99DataPlatform';
                    this.userForm.department = '大数据部门';
                }
            })
        },
        cancelInputCodeBox () {
            this.inputCodeVisible = false;
            this.userForm.mobile = this.initPhone;
        },
        submitCode () {
            let vm = this;
            vm.checkIdentifyCodeLoading = true;
            if (this.securityCode.length === 0) {
                this.$Message.error('请填写短信验证码');
            } else {
                setTimeout(() => {
                    this.$Message.success('验证码正确');
                    this.inputCodeVisible = false;
                    this.checkIdentifyCodeLoading = false;
                }, 1000);
            }
        },
        hasChangePhone () {
            this.phoneHasChanged = true;
            this.hasGetIdentifyCode = false;
            this.identifyCodeRight = false;
        },
        saveInfoAjax () {
            this.$Loading.start();
            this.save_loading = true;
            setTimeout(() => {
                const trueName = this.userForm.trueName;
                const mobile = this.userForm.mobile;
                const email = this.userForm.email;

                this.patchRequest('/user/save',{trueName,mobile,email}).then(res=>{
                    const result = res.data;
                    if(result.code === 0){
                        this.$Loading.finish();
                        this.$Message.success('保存成功');
                    }
                    this.save_loading = false;
                })

            }, 1000);
        }
    },
    mounted () {
        this.init();
    }
};
</script>
