let level = {
  bf37cd8a88a2cb91: 1,
  bf37cd8a88a2cb9c: 1,
  bf37cd8a88a2cb9b: 1,
  bf37cd8a88a2cb9w: 1,
  d0e294906a6a076f: 2,
  d0e294906a6a0766: 2,
  bb7b4d9341ffe881: 2,
  b5e0f0e3b6b24081: 2,
  '7e1135653e4ceb48': 2,
  '46ffab08872440d5': 2,
  f3bb46e711e89a28: 2,
  '078d93b64d47125m': 3,
  c82d433ad78a588b: 3,
  '078d93b64d47125b': 3,
  '0aba4979011e0cc8': 3,
  '4f9c15cdc02a35cs': 4,
  aead66f6681c705a: 4,
  '4f9c15cdc02a35cb': 4
}

let levelTrans = {
  1: [
    'bf37cd8a88a2cb91',
    'bf37cd8a88a2cb9w',
    'bf37cd8a88a2cb9c',
    'bf37cd8a88a2cb9b'
  ],
  2: [
    'd0e294906a6a076f',
    'd0e294906a6a0766',
    'bb7b4d9341ffe881',
    '46ffab08872440d5',
    'f3bb46e711e89a28',
    'b5e0f0e3b6b24081',
    '7e1135653e4ceb48'
  ],
  3: [
    '078d93b64d47125m',
    '0aba4979011e0cc8',
    'c82d433ad78a588b',
    '078d93b64d47125b'
  ],
  4: ['4f9c15cdc02a35cs', '4f9c15cdc02a35cb', 'aead66f6681c705a']
}

let historyList = [
  {
    time: 0.0,
    action: [
      { node_id: 'bf37cd8a88a2cb91', jobName: 'light1', status: 'running', startTime: '2019-08-03 19:24:55' }
    ]
  },
  {
    time: 0.5,
    action: [
      { node_id: 'bf37cd8a88a2cb9b', jobName: 'light', status: 'running' },
      { node_id: 'bf37cd8a88a2cb9b', jobName: 'light', status: 'success' },
      { node_id: 'bf37cd8a88a2cb9c', jobName: 'light', status: 'running' }
    ]
  },
  {
    time: 2.9,
    action: [
      { node_id: 'bf37cd8a88a2cb9c', jobName: 'light', status: 'success' },
      { node_id: 'bf37cd8a88a2cb9w', jobName: 'light', status: 'running' }
    ]
  },
  {
    time: 3.7,
    action: [
      { node_id: 'bf37cd8a88a2cb91', jobName: 'light2', status: 'success', startTime: '2019-08-03 19:24:55', endTime: '2019-08-03 20:33:11' },
      { node_id: 'bf37cd8a88a2cb9w', jobName: 'light', status: 'success' }
    ]
  },
  {
    time: 3.99,
    action: [
      { node_id: 'd0e294906a6a076f', jobName: 'light', status: 'running' }
    ]
  },
  {
    time: 4.0,
    action: [
      { node_id: 'd0e294906a6a0766', jobName: 'light', status: 'running' }
    ]
  },
  {
    time: 4.022147,
    action: [
      {
        node_id: 'd0e294906a6a0766',
        jobName: 'Generage 674 Features',
        status: 'success'
      }
    ]
  },
  {
    time: 4.070223,
    action: [
      { node_id: 'bb7b4d9341ffe881', jobName: 'light', status: 'running' }
    ]
  },
  {
    time: 4.079401,
    action: [
      {
        node_id: 'bb7b4d9341ffe881',
        jobName: 'light 0 Features',
        status: 'success'
      }
    ]
  },
  {
    time: 4.109985,
    action: [
      { node_id: '7e1135653e4ceb48', jobName: 'light', status: 'running' }
    ]
  },
  {
    time: 4.121786,
    action: [
      {
        node_id: '7e1135653e4ceb48',
        jobName: 'light 0 Features',
        status: 'success'
      }
    ]
  },
  {
    time: 4.230074,
    action: [
      {
        node_id: 'b5e0f0e3b6b24081',
        jobName: 'light',
        status: 'running'
      }
    ]
  },
  {
    time: 4.244237,
    action: [
      {
        node_id: 'b5e0f0e3b6b24081',
        jobName: 'light 0 Features',
        status: 'success'
      }
    ]
  },
  {
    time: 4.895238,
    action: [
      {
        node_id: 'f3bb46e711e89a28',
        jobName: 'light',
        status: 'running'
      }
    ]
  },
  {
    time: 5.180696,
    action: [
      {
        node_id: 'f3bb46e711e89a28',
        jobName: 'light 8 Features',
        status: 'success'
      }
    ]
  },
  {
    time: 8.343367,
    action: [
      {
        node_id: '46ffab08872440d5',
        jobName: 'light',
        status: 'running'
      }
    ]
  },
  {
    time: 18.569715,
    action: [
      { node_id: 'd0e294906a6a076f', jobName: 'Features', status: 'success' },
      {
        node_id: '46ffab08872440d5',
        jobName: 'light 45 Features',
        status: 'success'
      }
    ]
  },
  {
    time: 8.859715,
    action: [
      { node_id: '078d93b64d47125m', jobName: 'Models', status: 'running' }
    ]
  },
  {
    time: 8.869715,
    action: [
      {
        node_id: '078d93b64d47125b',
        jobName: 'light',
        status: 'running'
      }
    ]
  },
  {
    time: 8.975148,
    action: [
      {
        node_id: '078d93b64d47125b',
        jobName: 'light',
        status: 'success'
      }
    ]
  },
  {
    time: 8.97659,
    action: [
      {
        node_id: '0aba4979011e0cc8',
        jobName: 'light',
        status: 'running'
      }
    ]
  },
  {
    time: 9.103898,
    action: [
      {
        node_id: '0aba4979011e0cc8',
        jobName: 'light',
        status: 'success'
      }
    ]
  },
  {
    time: 9.105366,
    action: [
      {
        node_id: 'c82d433ad78a588b',
        jobName: 'light',
        status: 'running'
      }
    ]
  },
  {
    time: 9.788222,
    action: [
      { node_id: '078d93b64d47125m', jobName: 'Models', status: 'success' },
      {
        node_id: 'c82d433ad78a588b',
        jobName: 'light',
        status: 'success'
      }
    ]
  },
  {
    time: 10.078222,
    action: [
      { node_id: '4f9c15cdc02a35cs', jobName: 'light', status: 'running' }
    ]
  },
  {
    time: 10.088222,
    action: [
      { node_id: '4f9c15cdc02a35cb', jobName: 'light', status: 'running' }
    ]
  },
  {
    time: 10.719785,
    action: [
      { node_id: '4f9c15cdc02a35cb', jobName: 'light', status: 'failure' }
    ]
  },
  {
    time: 12.367431,
    action: [
      { node_id: 'aead66f6681c705a', jobName: 'light', status: 'running' }
    ]
  },
  {
    time: 12.618698,
    action: [
      {
        node_id: '4f9c15cdc02a35cs',
        jobName: 'Get Approved Amount 3258, PASS',
        status: 'success'
      },
      { node_id: 'aead66f6681c705a', jobName: 'light', status: 'success' }
    ]
  }
]

export { level, levelTrans, historyList }
