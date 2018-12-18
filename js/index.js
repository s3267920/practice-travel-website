(function() {
  function getAjax() {
    let getXhr = new XMLHttpRequest();
    let url =
      'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97&limit=268';
    getXhr.open('GET', url, true);
    getXhr.responseType = 'json';
    getXhr.setRequestHeader('Content-type', 'application/json');
    getXhr.send();
    getXhr.onload = function() {
      let res = getXhr.response.result.records;
      ajaxToLocalStorage(res);
    };
    //https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97&limit=268
  }
  //存到localStorage裡
  function ajaxToLocalStorage(res) {
    let resStr = JSON.stringify(res);
    localStorage.setItem('resItem', resStr);
  }
  //將數據存在data中
  let data = JSON.parse(localStorage.getItem('resItem'));

  function selectOption(zone) {
    let zoneSelect = document.querySelector('#zone_select');
    for (let i = 0; i < zone.length; i++) {
      let newOption = document.createElement('option');
      newOption.value = zone[i];
      newOption.textContent = zone[i];
      zoneSelect.appendChild(newOption);
    }
  }

  function createZone(res) {
    //區域做篩選出唯一值
    let resZone = [];
    for (let i = 0; i < res.length; i++) {
      resZone.push(res[i].Zone);
    }
    let newZone = resZone.filter(function(el, index, arr) {
      return arr.indexOf(el) === index;
    });
    selectOption(newZone);
  }

  function createLi(res) {
    //因為 createLi() 中是用 appendChild 所以 filter之前要先清空數據
    let contentList = document.querySelector('.content_list');
    contentList.innerHTML = '';
    for (let i = 0; i < res.length; i++) {
      let newLi = document.createElement('li');
      newLi.innerHTML += `
      <div class="picture">
              <img src="${res[i].Picture1}" alt="">
              <p class="name">${res[i].Name}</p>
          <span class="zone">${res[i].Zone}</span>
            </div>
        <ul class="info">
          <li><img src="./img/icons_clock.png" alt="clock_icon" class="clock_icon" />${res[i].Opentime}</li>
          <li><img src="./img/icons_pin.png" alt="place_icon" class="place_icon">${res[i].Add}</li>
          <li><img src="./img/icons_phone.png" alt="phone_icon" class="phone_icon"></span>${res[i].Tel}</li>
        </ul>
        <div class="ticket_info"><img src="./img/icons_tag.png" alt="ticket_icon">${res[i].Ticketinfo.substr(
          0,
          26
        )}</div>
          `;
      contentList.appendChild(newLi);
    }
  }
  // 根據下拉式選單的值篩選出數據
  function filterZone(data) {
    let zoneSelect = document.querySelector('#zone_select');
    let contentZone = document.querySelector('.content_zone');
    let contentList = document.querySelector('.content_list');
    let poplarZoneUl = document.querySelector('.popular_zone ul');
    zoneSelect.addEventListener('change', function(e) {
      let newZone = data.filter(zone => {
        if (e.target.value === zone.Zone) {
          return zone;
        } else if (e.target.value === 'none') {
          return zone;
        }
      });
      pageFilter(newZone);
      if (e.target.value === 'none') {
        contentZone.textContent = '所有地點';
      } else {
        contentZone.textContent = e.target.value;
      }
    });
    poplarZoneUl.addEventListener('click', function(e) {
      let newZone = data.filter(zone => {
        if (e.target.textContent === zone.Zone) {
          return zone;
        }
      });
      // contentList.textContent = '';
      pageFilter(newZone);

      contentZone.textContent = e.target.textContent;
    });
    pageFilter(data);
  }
  // console.log(data);
  function pageFilter(newZone) {
    /*
    先訂出目前所在的頁數 currentPage
    每頁所顯示的數量 pageLimit
    根據頁數來決定出現的值
    */
    let pageList = document.querySelector('.page ul');
    let currentPage = 1;
    let pageLimit = 8;
    let startPage = 1;
    let endPage = 5;
    let totalPage = Math.ceil(newZone.length / 8);
    let newData = [];

    function createPage() {
      let newLi = '';
      let prevLi = `<li>
                      <a href="javascript:;" class="prev"><span class="triangle_left"></span>prev</a>
                    </li>`;
      let nextLi = ` <li>
                      <a href="javascript:;" class="next">next<span class="triangle_right"></span></a>
                    </li>`;
      if (totalPage === 0) {
        pageList.innerHTML = prevLi + `<li><a href="" class="disable_touch">1</a></li>` + nextLi;
      } else {
        for (let j = startPage; j <= endPage; j++) {
          newLi += `<li><a href="javascript:;" class="">${j}</a></li>`;
          pageList.innerHTML = prevLi + newLi + nextLi;
        }
      }
    }
    if (totalPage > 5) {
      endPage = 5;
      createPage();
    } else {
      endPage = totalPage;
      createPage();
    }
    if (startPage === 1) {
      let prev = document.querySelector('.prev').parentNode;
      prev.style.display = 'none';
    } else {
      let prev = document.querySelector('.prev').parentNode;
      prev.style.display = 'flex';
    }
    if (totalPage < 5) {
      let next = document.querySelector('.next').parentNode;
      next.style.display = 'none';
    } else {
      let next = document.querySelector('.next').parentNode;
      next.style.display = 'flex';
    }
    currentPageData(newZone);
    //頁數為一隱藏 prev，最後一頁隱藏next
    pageList.addEventListener('click', function(e) {
      if (e.target.classList.value === 'next') {
        if (endPage === totalPage - 1) {
          startPage++;
          endPage++;
          createPage();
          let next = document.querySelector('.next').parentNode;
          next.style.display = 'none';
        } else {
          startPage++;
          endPage++;
          createPage();
        }
      } else if (e.target.classList.value === 'prev') {
        if (startPage === 2) {
          startPage--;
          endPage--;
          createPage();
          let prev = document.querySelector('.prev').parentNode;
          prev.style.display = 'none';
        } else {
          startPage--;
          endPage--;
          createPage();
        }
      } else if (!isNaN(Number(e.target.textContent))) {
        currentPage = Number(e.target.textContent);
        let pageListUl = e.target.parentElement.parentElement;
        pageListUl.querySelectorAll('.disable_touch').forEach(e => e.classList.remove('disable_touch'));
        e.target.classList.add('disable_touch');
        currentPageData(newZone);
        //參考https://developer.mozilla.org/zh-CN/docs/Web/API/Window/scrollTo
        window.scrollTo({
          top: 300,
          behavior: 'smooth'
        });
      }
    });

    //根據頁數來給值
    function currentPageData(newZone) {
      /*為了處裡最後一頁因為數值不能被整除的問題，所以在最後一頁再做一次篩選 */
      let newZ = newZone;
      let endPageLimit = 0;
      if (newZ.length % 8 === 0) {
        pageLimit = 8;
      } else if (newZ.length < 8) {
        pageLimit = newZ.length;
      } else {
        if (currentPage === totalPage) {
          if (newZ.length % 8 !== 0) {
            endPageLimit = 8 - (newZ.length % 8);
          }
        } else {
          pageLimit = 8;
        }
      }
      newData = [];
      // console.log(data);
      for (let i = pageLimit * (currentPage - 1); i < pageLimit * currentPage - endPageLimit; i++) {
        newData.push(newZ[i]);
      }
      try {
        createLi(newData);
      } catch (error) {
        return;
      }
    }
  }
  getAjax();
  createZone(data);
  filterZone(data);
})();
//.disable_touch
