import Main from '_c/main'
import parentView from '_c/parent-view'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中，示例看QQ群路由配置
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export default [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/login/login.vue')
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          hideInMenu: true,
          title: '首页',
          notCache: true,
          icon: 'md-home'
        },
        component: () => import('@/view/single-page/home')
      }
    ]
  },
/*
  {
    path: '',
    name: 'doc',
    meta: {
      title: '文档',
      href: 'https://lison16.github.io/iview-admin-doc/#/',
      icon: 'ios-book'
    }
  },
  {
    path: '/join',
    name: 'join',
    component: Main,
    meta: {
      hideInBread: true
    },
    children: [
      {
        path: 'join_page',
        name: 'join_page',
        meta: {
          icon: '_qq',
          title: 'QQ群'
        },
        component: () => import('@/view/join-page.vue')
      }
    ]
  },
  {
    path: '/components',
    name: 'components',
    meta: {
      icon: 'logo-buffer',
      title: '组件'
    },
    component: Main,
    children: [
      {
        path: 'tree_select_page',
        name: 'tree_select_page',
        meta: {
          icon: 'md-arrow-dropdown-circle',
          title: '树状下拉选择器'
        },
        component: () => import('@/view/components/tree-select/index.vue')
      },
      {
        path: 'count_to_page',
        name: 'count_to_page',
        meta: {
          icon: 'md-trending-up',
          title: '数字渐变'
        },
        component: () => import('@/view/components/count-to/count-to.vue')
      },
      {
        path: 'drag_list_page',
        name: 'drag_list_page',
        meta: {
          icon: 'ios-infinite',
          title: '拖拽列表'
        },
        component: () => import('@/view/components/drag-list/drag-list.vue')
      },
      {
        path: 'drag_drawer_page',
        name: 'drag_drawer_page',
        meta: {
          icon: 'md-list',
          title: '可拖拽抽屉'
        },
        component: () => import('@/view/components/drag-drawer')
      },
      {
        path: 'org_tree_page',
        name: 'org_tree_page',
        meta: {
          icon: 'ios-people',
          title: '组织结构树'
        },
        component: () => import('@/view/components/org-tree')
      },
      {
        path: 'tree_table_page',
        name: 'tree_table_page',
        meta: {
          icon: 'md-git-branch',
          title: '树状表格'
        },
        component: () => import('@/view/components/tree-table/index.vue')
      },
      {
        path: 'cropper_page',
        name: 'cropper_page',
        meta: {
          icon: 'md-crop',
          title: '图片裁剪'
        },
        component: () => import('@/view/components/cropper/cropper.vue')
      },
      {
        path: 'tables_page',
        name: 'tables_page',
        meta: {
          icon: 'md-grid',
          title: '多功能表格'
        },
        component: () => import('@/view/components/tables/tables.vue')
      },
      {
        path: 'split_pane_page',
        name: 'split_pane_page',
        meta: {
          icon: 'md-pause',
          title: '分割窗口'
        },
        component: () => import('@/view/components/split-pane/split-pane.vue')
      },
      {
        path: 'markdown_page',
        name: 'markdown_page',
        meta: {
          icon: 'logo-markdown',
          title: 'Markdown编辑器'
        },
        component: () => import('@/view/components/markdown/markdown.vue')
      },
      {
        path: 'editor_page',
        name: 'editor_page',
        meta: {
          icon: 'ios-create',
          title: '富文本编辑器'
        },
        component: () => import('@/view/components/editor/editor.vue')
      },
      {
        path: 'icons_page',
        name: 'icons_page',
        meta: {
          icon: '_bear',
          title: '自定义图标'
        },
        component: () => import('@/view/components/icons/icons.vue')
      }
    ]
  },
  {
    path: '/update',
    name: 'update',
    meta: {
      icon: 'md-cloud-upload',
      title: '数据上传'
    },
    component: Main,
    children: [
      {
        path: 'update_table_page',
        name: 'update_table_page',
        meta: {
          icon: 'ios-document',
          title: '上传Csv'
        },
        component: () => import('@/view/update/update-table.vue')
      },
      {
        path: 'update_paste_page',
        name: 'update_paste_page',
        meta: {
          icon: 'md-clipboard',
          title: '粘贴表格数据'
        },
        component: () => import('@/view/update/update-paste.vue')
      }
    ]
  },
  {
    path: '/excel',
    name: 'excel',
    meta: {
      icon: 'ios-stats',
      title: 'EXCEL导入导出'
    },
    component: Main,
    children: [
      {
        path: 'upload-excel',
        name: 'upload-excel',
        meta: {
          icon: 'md-add',
          title: '导入EXCEL'
        },
        component: () => import('@/view/excel/upload-excel.vue')
      },
      {
        path: 'export-excel',
        name: 'export-excel',
        meta: {
          icon: 'md-download',
          title: '导出EXCEL'
        },
        component: () => import('@/view/excel/export-excel.vue')
      }
    ]
  },
  {
    path: '/tools_methods',
    name: 'tools_methods',
    meta: {
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'tools_methods_page',
        name: 'tools_methods_page',
        meta: {
          icon: 'ios-hammer',
          title: '工具方法',
          beforeCloseName: 'before_close_normal'
        },
        component: () => import('@/view/tools-methods/tools-methods.vue')
      }
    ]
  },
  {
    path: '/i18n',
    name: 'i18n',
    meta: {
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'i18n_page',
        name: 'i18n_page',
        meta: {
          icon: 'md-planet',
          title: 'i18n - {{ i18n_page }}'
        },
        component: () => import('@/view/i18n/i18n-page.vue')
      }
    ]
  },
  {
    path: '/error_store',
    name: 'error_store',
    meta: {
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'error_store_page',
        name: 'error_store_page',
        meta: {
          icon: 'ios-bug',
          title: '错误收集'
        },
        component: () => import('@/view/error-store/error-store.vue')
      }
    ]
  },
  {
    path: '/error_logger',
    name: 'error_logger',
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    component: Main,
    children: [
      {
        path: 'error_logger_page',
        name: 'error_logger_page',
        meta: {
          icon: 'ios-bug',
          title: '错误收集'
        },
        component: () => import('@/view/single-page/error-logger.vue')
      }
    ]
  },
  {
    path: '/directive',
    name: 'directive',
    meta: {
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'directive_page',
        name: 'directive_page',
        meta: {
          icon: 'ios-navigate',
          title: '指令'
        },
        component: () => import('@/view/directive/directive.vue')
      }
    ]
  },
  {
    path: '/multilevel',
    name: 'multilevel',
    meta: {
      icon: 'md-menu',
      title: '多级菜单'
    },
    component: Main,
    children: [
      {
        path: 'level_2_1',
        name: 'level_2_1',
        meta: {
          icon: 'md-funnel',
          title: '二级-1'
        },
        component: () => import('@/view/multilevel/level-2-1.vue')
      },
      {
        path: 'level_2_2',
        name: 'level_2_2',
        meta: {
          access: ['super_admin'],
          icon: 'md-funnel',
          showAlways: true,
          title: '二级-2'
        },
        component: parentView,
        children: [
          {
            path: 'level_2_2_1',
            name: 'level_2_2_1',
            meta: {
              icon: 'md-funnel',
              title: '三级'
            },
            component: () => import('@/view/multilevel/level-2-2/level-2-2-1.vue')
          },
          {
            path: 'level_2_2_2',
            name: 'level_2_2_2',
            meta: {
              icon: 'md-funnel',
              title: '三级'
            },
            component: () => import('@/view/multilevel/level-2-2/level-2-2-2.vue')
          }
        ]
      },
      {
        path: 'level_2_3',
        name: 'level_2_3',
        meta: {
          icon: 'md-funnel',
          title: '二级-3'
        },
        component: () => import('@/view/multilevel/level-2-3.vue')
      }
    ]
  },
  {
    path: '/argu',
    name: 'argu',
    meta: {
      hideInMenu: true
    },
    component: Main,
    children: [
      {
        path: 'params/:id',
        name: 'params',
        meta: {
          icon: 'md-flower',
          title: route => `{{ params }}-${route.params.id}`,
          notCache: true,
          beforeCloseName: 'before_close_normal'
        },
        component: () => import('@/view/argu-page/params.vue')
      },
      {
        path: 'query',
        name: 'query',
        meta: {
          icon: 'md-flower',
          title: route => `{{ query }}-${route.query.id}`,
          notCache: true
        },
        component: () => import('@/view/argu-page/query.vue')
      }
    ]
  },
*/  
  {
    path: '/dag',
    name: 'dag',
    component: Main,
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    children: [
      {
        path: 'dag-record',
        name: 'dag-record',
        meta: {
          icon: 'md-notifications',
          title: '调度DAG'
        },
        component: () => import('@/view/dag/dag-record')
      }
    ]
  },
  {
    path: '/message',
    name: 'message',
    component: Main,
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    children: [
      {
        path: 'message',
        name: 'message-list',
        meta: {
          icon: 'md-notifications',
          title: '消息中心'
        },
        component: () => import('@/view/single-page/message')
      }
    ]
  },
  {
    path: '/personal-info',
    name: 'personal-info',
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    component: Main,
    children: [
      {
        path: 'personal-info-page',
        name: 'personal-info-page',
        meta: {
          icon: 'md-person',
          title: '个人信息'
        },
        component: () => import('@/view/personal-info')
      }
    ]
  },
  {
    path: '/cluster',
    name: 'cluster',
    meta: {
      access: ['admin'],
      title: '集群管理',
      icon: 'md-speedometer'
    },
    component: Main,
    children: [
      {
        path: 'agent',
        name: 'agent-list',
        meta: {
          icon: 'md-desktop',
          title: '执行器',
          notCache: true
        },
        component: () => import('@/view/cluster/agent-list.vue')
      },
      {
        path: 'agent/:id',
        name: 'agent-recent',
        meta: {
          icon: 'md-stats',
          title: route => `执行器近况 - ${route.params.name}`,
          hideInMenu: true
        },
        component: () => import('@/view/cluster/agent-recent.vue')
      },
      { 
        path: 'group',
        name: 'agent-group-list',
        meta: {
          title: '执行器组',
          icon: 'md-bookmarks'
        },
        component: () => import('@/view/cluster/agent-group-list.vue')
      }
    ]
  },
  {
    path: '/metadata',
    name: 'metadata',
    meta: {
      access: ['admin'],
      icon: 'md-bulb',
      title: '数据集成',
    },
    component: Main,
    children: [
      {
        path: 'connection',
        name: 'connection-list',
        meta: {
          icon: 'md-globe',
          title: '数据连接',
        },
        component: () => import('@/view/metadata/connection-list.vue')
      },
      {
        path: 'table',
        name: 'table-list',
        meta: {
          icon: 'md-grid',
          title: '表管理',
        },
        component: () => import('@/view/metadata/table-list.vue')
      },
      {
        path: 'table/:id',
        name: 'table-detail',
        meta: {
          icon: 'md-grid',
          title: route => `表详情 - ${route.params.dbName}.${route.params.tableName}`,
          hideInMenu: true
        },
        component: () => import('@/view/metadata/table-detail.vue')
      }
    ]
  },
  {
    path: '/development',
    name : 'development',
    meta: {
      access: ['admin'],
      icon: 'md-code-working',
      title: '数据开发',
    },
    component: Main,
    children : [
      {
        path: 'adhoc',
        name: 'adhoc-sql',
        meta: {
          icon: 'md-bug',
          title: '即席查询',
        },
        component: () => import('@/view/development/adhoc-sql.vue')
      },
      {
        path: 'task',
        name: 'task-list',
        meta: {
          icon: 'md-cog',
          title: '任务列表',
        },
        component: () => import('@/view/development/task-list.vue')
      },
      {
        path: 'etl/:id',
        name: 'task-ETL',
        meta: {
          hideInMenu: true,
          icon: 'md-code-working',
          title: route => `ETL任务 - ${route.params.title}`
        },
        component: () => import('@/view/development/task-etl.vue')
      },
      {
        path: 'sql/:id',
        name: 'task-SQL',
        meta: {
          hideInMenu: true,
          icon: 'md-code-working',
          title: route => `SQL任务- ${route.params.title}`
        },
        component: () => import('@/view/development/task-sql.vue')
      },
      {
        path: 'shell/:id',
        name: 'task-Shell',
        meta: {
          hideInMenu: true,
          icon: 'md-code-working',
          title: route => `Shell任务 - ${route.params.title}`
        },
        component: () => import('@/view/development/task-shell.vue')
      },
      {
        path: 'report/:id',
        name: 'task-Report',
        meta: {
          hideInMenu: true,
          icon: 'md-code-working',
          title: route => `Report任务 - ${route.params.title}`
        },
        component: () => import('@/view/development/task-report.vue')
      },
      /*
      {
        path: 'validation',
        name: 'validation-list',
        meta: {
          icon: 'ios-book',
          title: '数据校验',
        },
        component: () => import('@/view/development/validation-list.vue')
      },
      */
      {
        path: 'threshold',
        name: 'threshold-list',
        meta: {
          icon: 'md-trending-up',
          title: '阈值监控',
        },
        component: () => import('@/view/development/threshold-list.vue')
      },
      {
        path: 'threshold/:id',
        name: 'task-threshold',
        meta: {
          hideInMenu: true,
          icon: 'md-code-working',
          title: route => `阈值详情 - ${route.params.title}`
        },
        component: () => import('@/view/development/task-threshold.vue')
      },
      /*,
      {
        path: 'auto-report',
        name: 'auto-report-list',
        meta: {
          icon: 'logo-xbox',
          title: '自动日报',
        },
        component: () => import('@/view/development/auto-report-list.vue')
      },
      {
        path: 'auto-report/:name',
        name: 'auto-report',
        meta: {
          hideInMenu: true,
          icon: 'logo-xbox',
          title: route => `日报详情 - ${route.params.name}`
        },
        component: () => import('@/view/development/auto-report.vue')
      }
      {
        path: 'mini-report',
        name: 'mini-report-list',
        meta: {
          icon: 'md-podium',
          title: '微报表'
        },
        component: () => import('@/view/development/mini-report-list.vue')
      }
      */
    ]
  },
  {
    path: '/monitor' ,
    name : 'monitor-center',
    meta: {
      access: ['admin'],
      icon : 'md-eye',
      title : '监控中心',
    },
    component: Main,
    children : [
      { 
        path: 'record',
        name: 'record-list', 
        meta: {
          icon: 'md-list-box',
          title: '已调度任务'
        },
        component: () => import('@/view/monitor/record-list.vue')
      },
      { 
        path: 'record/:recordId',
        name: 'record',
        meta: {
          hideInMenu: true,
          icon: 'md-stopwatch',
          title: route => `调度详情 - ${route.params.jobName}`
        },
        component: () => import('@/view/monitor/record.vue')
      },
      { 
        path: 'not-start-record',
        name: 'not-start-record-list',
        meta: {
          icon: 'md-clock',
          title: '待调度任务'
        },
        component: () => import('@/view/monitor/not-start-record-list.vue')
      }
    ]
  },
/*
  {
    path: '/other',
    name: 'other',
    component: Main,
    meta: {
      hideInBread: true
    },
    children: [
      {
        path: '/q-and-a',
        name: 'q-and-a',
        meta: {
          icon: 'md-help-circle',
          title: 'Q & A'
        },
        component: () => import('@/view/q-and-a/q-and-a.vue')
      }
    ]
  },
*/
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/404.vue')
  }
]
