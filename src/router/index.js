import Vue from 'vue';
import iView from 'iview';
import axios from 'axios';
import Util from '../libs/util';
import VueRouter from 'vue-router';
import Cookies from 'js-cookie';
import {routers, otherRouter, appRouter} from './router';
import moment from 'moment';

Vue.use(VueRouter);

Vue.prototype.$http = axios;


axios.interceptors.response.use(data => {
    if (data.status && data.status == 200 && data.data.status == 'error') {
        iView.Message.error(data.data);
        return;
    }
    return data;
}, err => {
    if (err.response.status == 504 || err.response.status == 404) {
        iView.Message.error({content:'服务器被吃了⊙﹏⊙∥',duration: 120});
    } else if (err.response.status == 403) {
        iView.Message.error({content:'权限不足,请联系管理员!',duration: 120});
    } else {
        iView.Message.error({content:'未知错误!',duration: 120});
    }
    return Promise.resolve(err);
})

const base = '/api';


Vue.prototype.getRequest = (url) => {
    return axios({
        method: 'get',
        url: `${base}${url}`
    });
}

Vue.prototype.postRequest = (url, params) => {
    return axios({
        method: 'post',
        url: `${base}${url}`,
        data: params,
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
}

Vue.prototype.patchRequest = (url, params) => {
    return axios({
        method: 'patch',
        url: `${base}${url}`,
        data: params,
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
}

Vue.prototype.putRequest = (url, params) => {
    return axios({
        method: 'put',
        url: `${base}${url}`,
        data: params,
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
}

Vue.prototype.deleteRequest = (url) => {
    return axios({
        method: 'delete',
        url: `${base}${url}`
    });
}

Vue.prototype.dateTimeFormat = function(timestamp){
    const objRegExp = /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/ 
    const dateTime = moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    if(!objRegExp.test(dateTime)) {
        return '— —'
    } else {
        return dateTime
    }
}

Vue.prototype.dateFormat = function(timestamp){
    const objRegExp = /^(\d{4})\-(\d{2})\-(\d{2})$/ 
    const date = moment(timestamp).format('YYYY-MM-DD')
    if(!objRegExp.test(date)) {
        return '— —'
    } else {
        return date
    }
}

Vue.prototype.timeDiff = function(startTimestamp, endTimestamp){
    if(endTimestamp === null){
        return ''
    }
    const start = moment(startTimestamp)
    const end = endTimestamp === null ? new Date() : moment(endTimestamp)
    const du = moment.duration(end - start, 'ms')

    const days = du.get('days')
    const hours = du.get('hours')
    const minutes = du.get('minutes')
    const seconds = du.get('seconds')

    let txt = seconds+"秒"
    if(minutes > 0) txt =  minutes+"分"+ txt;
    if(hours > 0) txt =  hours+"小时"+ txt;
    if(days > 0) txt =  days+"天"+ txt;

    return txt;
}




// 路由配置
const RouterConfig = {
    // mode: 'history',
    routes: routers
};

export const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    Util.title(to.meta.title);
    if (Cookies.get('locking') === '1' && to.name !== 'locking') { // 判断当前是否是锁定状态
        next({
            replace: true,
            name: 'locking'
        });
    } else if (Cookies.get('locking') === '0' && to.name === 'locking') {
        next(false);
    } else {
        if (!Cookies.get('user') && to.name !== 'login') { // 判断是否已经登录且前往的页面不是登录页
            next({
                name: 'login'
            });
        } else if (Cookies.get('user') && to.name === 'login') { // 判断是否已经登录且前往的是登录页
            Util.title();
            next({
                name: 'home_index'
            });
        } else {
            const curRouterObj = Util.getRouterObjByName([otherRouter, ...appRouter], to.name);
            if (curRouterObj && curRouterObj.access !== undefined) { // 需要判断权限的路由
                if (curRouterObj.access === parseInt(Cookies.get('access'))) {
                    Util.toDefaultPage([otherRouter, ...appRouter], to.name, router, next); // 如果在地址栏输入的是一级菜单则默认打开其第一个二级菜单的页面
                } else {
                    next({
                        replace: true,
                        name: 'error-403'
                    });
                }
            } else { // 没有配置权限的路由, 直接通过
                Util.toDefaultPage([...routers], to.name, router, next);
            }
        }
    }
});

router.afterEach((to) => {
    Util.openNewPage(router.app, to.name, to.params, to.query);
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});
