/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/monitors/launch              ->  launch
 */

'use strict';

import _ from 'lodash';
import monitor from '../../lib/monitor';

// Gets a list of Things
export function launch(req, res) {
  console.log('start to run');
  monitor.addOrUpdateMonitor({
    url: 'http://www.xmws.gov.cn/sydwzk/policy/policy.jsp?TypeID=7',
    jqpath: 'form[name=formRight] table:nth-of-type(5) td a',
    nuser: 'hjy',
    notifiers: {
      emails: ['johnnyyellow@gmail.com']
    },
    blockname: '厦门卫生事业单位'
  }, function() {
    console.log('success to start');
  });
  monitor.addOrUpdateMonitor({
    url: 'http://www.xmrs.gov.cn/syggc/syzp/zkdt/',
    jqpath: '#news a',
    nuser: 'hjy',
    notifiers: {
      emails: ['johnnyyellow@gmail.com']
    },
    blockname: '厦门事业单位'
  }, function() {
    console.log('success to start');
  });
  monitor.addOrUpdateMonitor({
    url: 'http://www.jimei.gov.cn/xxgk/F394/rsxx/zkzp/',
    jqpath: 'table.h30.mar_t10 a',
    user: 'hjy',
    notifiers: {
      emails: ['johnnyyellow@gmail.com']
    },
    blockname: '集美人事'
  }, function() {
    console.log('success to start');
  });
  monitor.addOrUpdateMonitor({
    url: 'http://www.haicang.gov.cn/xx/zdxxgk/jbxxgk/rsxx/zkzp/',
    jqpath: 'div.hc15_xx_list li a',
    user: 'hjy',
    notifiers: {
      emails: ['johnnyyellow@gmail.com']
    },
    blockname: '海沧人事'
  }, function() {
    console.log('success to start');
  });
  res.status(200).end();
}