<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <div class="login-con">
            <Card icon="log-in" title="欢迎登录" :bordered="false">
                <div class="form-con">
                    <Form ref="loginForm" :model="form" :rules="rules">
                        <FormItem prop="username">
                            <Input v-model="form.username" placeholder="请输入用户名">
                                <span slot="prepend">
                                    <Icon :size="16" type="person"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="password">
                            <Input type="password" v-model="form.password" placeholder="请输入密码">
                                <span slot="prepend">
                                    <Icon :size="14" type="locked"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem>
                            <Button @click="handleSubmit" type="primary" long>登录</Button>
                        </FormItem>
                    </Form>
                    <p class="login-tip">忘了密码？ | &nbsp;&nbsp;注册新帐号&nbsp;&nbsp; | &nbsp;&nbsp;意见反馈</p>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
import Cookies from 'js-cookie';
import md5 from 'js-md5';
import Util from '@/libs/util';

export default {
    data () {
        return {
            form: {
                username: '',
                password: ''
            },
            rules: {
                username: [
                    { required: true, message: '账号不能为空', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '密码不能为空', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        handleSubmit () {
            this.$Loading.start();
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    const username = this.form.username
                    const password = md5(this.form.password)
                    this.postRequest('/user/login',{username, password}).then(res=>{
                        const result = res.data;
                        if(result.code === 0){
                            this.$Loading.finish();
                            Util.checkUnreadMessage(this);
                            /* 由服务器端完成
                            Cookies.set('user', this.form.username);
                            if (this.form.username === 'iview_admin') {
                                Cookies.set('access', 0);
                            } else {
                                Cookies.set('access', 1);
                            }
                            */
                            //设置头像
                            this.$store.commit('setAvator', 'https://i2.wp.com/coding.memory-forest.com/wp-content/uploads/2011/07/github.png');
                            //跳转到首页
                            this.$router.push({
                                name: 'home_index'
                            });
                        } else {
                            this.$Message.error(result.msg);
                            this.$Loading.error();
                        }
                    })
                } else {
                    this.$Loading.error();
                }
            });
        }
    },
    mounted () {
    }
};
</script>

<style>

</style>
