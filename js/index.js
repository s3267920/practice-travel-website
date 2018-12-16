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

  function ajaxToLocalStorage(res) {
    //存到localStorage裡
    let resStr = JSON.stringify(res);
    localStorage.setItem('resItem', resStr);
    let localRes = JSON.parse(localStorage.getItem('resItem'));
  }
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
    let contentList = document.querySelector('.content_list');
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
  function filterZone(res) {
    let zoneSelect = document.querySelector('#zone_select');
    zoneSelect.addEventListener('change', function(e) {
      let newZone = data.filter(zone => {
        if (e.target.value === zone.Zone) {
          return zone;
        } else if (e.target.value === 'none') {
          return zone;
        }
      });
      let contentZone = document.querySelector('.content_zone');
      //因為 createLi() 中是用 appendChild 所以 filter之前要先清空數據
      let contentList = document.querySelector('.content_list');
      contentList.textContent = '';
      createLi(newZone);
      if (e.target.value === 'none') {
        contentZone.textContent = '所有地點';
      } else {
        contentZone.textContent = e.target.value;
      }
    });
  }
  getAjax();
  createZone(data);
  createLi(data);
  filterZone(data);
  // console.log(filterZone(data));
})();
//.disable_touch
