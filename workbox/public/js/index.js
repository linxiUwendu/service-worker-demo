define(function (require) {
  'use strict';
  let axios = require('axios');

  // 判断当前浏览器是否支持serviceWorker
  if ('serviceWorker' in navigator) {
    // 当页面加载完成就创建一个serviceWorker
    // 首次访问，浏览器不知道哪些资源需要下载，也不知道有个线程等待创建
    // 如果在下载图片等资源过程中，还要额外加一个线程处理service worker，无疑加重了性能消耗
    // 首次加载页面应该加载关键资源，减少白屏时间
    // 所以延迟注册service worker
    window.addEventListener('load', () => {
      // serviceworker工作文件，要求跟注册它的文件地址同源
      // 若加载CDN的文件，可通过nginx代理修改文件真正访问位置
      // register方法返回Promise对象
      // scope 参数是可选的，可以用来指定你想让 service worker 控制的内容的子目录。 在这个例子里，我们指定了 '/'，表示 根网域下的所有内容。这也是默认值
      navigator.serviceWorker
        .register('./serviceWorker.js', { scope: '/' })
        .then((registration) => {
          console.log(
            'ServiceWorker registration successful with scope: ',
            registration.scope,
          );
        })
        .catch((err) => {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }

  function render(data) {
    let html = data.subjects
      .map(function (subject) {
        return `
        <li>
            <img src="${subject.images.medium}"/>
            <p>${subject.title}</p>
        </li>
        `;
      })
      .join('');
    return html;
  }

  window.onload = () => {
    // 异步请求数据，并在前端渲染
    axios.get('/api/movies').then(function (response) {
      let $movieList = document.querySelector('.movie-list');

      if (response.status !== 200) {
        $movieList.innerHTML = '网络错误';
        return;
      }
      $movieList.innerHTML = render(response.data);
    });
  };
});

// import axios from 'axios'
// export default {

// }
