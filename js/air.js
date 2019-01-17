//https://opendata.epa.gov.tw/ws/Data/AQI/?$format=json
(function () {
  let url = 'https://opendata.epa.gov.tw/ws/Data/AQI/?$format=json';
  let attentionCityZone = JSON.parse(localStorage.getItem('zone')) || [];
  let attentionCityData = [];
  $.ajax({
    url: url,
    contentType: 'application/json',
    method: 'GET',
    dataType: 'jsonp'
  }).done(function (res) {
    getCity(res);
    //用不會變化的zone來做資料篩選，確保關注城市的部分資料都是最新的。
    attentionCityZone.forEach(zone => {
      res.filter(data => {
        if (data.SiteName === zone) {
          return attentionCityData.push(data);
        }
      })
    });
    filterData(res);
    let resToObj = JSON.stringify(res);
    localStorage.setItem('data', resToObj);

  });

  function filterData(res) {
    let contentList = document.querySelector('#contentList');
    let citySelect = document.querySelector('#city_select');
    if (citySelect.value === 'none') {
      createCard(res);
      createAttention(attentionCityData);
    }
    citySelect.addEventListener('change', function (e) {
      for (let i = 0; i < res.length; i++) { }
      let newData = res.filter(el => {
        if (e.target.value === el.County) {
          return el;
        }
      });
      createCard(newData);
    });
    contentList.addEventListener('click', function (e) {
      //點中星星icon（即svg 跟 path)
      if (e.target.nodeName === 'svg') {
        let zone = e.target.parentNode.parentNode.children[1].children[1].textContent;
        if (e.target.parentNode.children[0].dataset.prefix === 'far') {
          addToAttention(zone);
        }
      } else if (e.target.nodeName === 'path') {
        let zone = e.target.parentNode.parentNode.parentNode.children[1].children[1].textContent;
        if (e.target.parentNode.parentNode.children[0].dataset.prefix === 'far') {
          addToAttention(zone);
        }
      }
    });
    let attentionList = document.querySelector('#attentionList');
    attentionList.addEventListener('click', function (e) {
      if (e.target.nodeName === 'svg') {
        let zone = e.target.parentNode.parentNode.children[1].children[1].textContent;
        deleteAttention(zone);
      } else if (e.target.nodeName === 'path') {
        let zone = e.target.parentNode.parentNode.parentNode.children[1].children[1].textContent;
        deleteAttention(zone);
      }
    });

    function addToAttention(zone) {
      /*
      判斷 attentionCityZone 跟 attentionCityData裡面有沒有資料，沒有的話再加入 
      使用some函數來判斷條件是否成立//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
      */
      if (!attentionCityZone.length) {
        attentionCityZone.push(zone);
      } else {
        let isRepeat = function (el) {
          return el === zone;
        };
        let check = attentionCityZone.some(isRepeat);
        if (check) {
          return;
        } else {
          attentionCityZone.push(zone);
        }
      }
      res.filter(data => {
        if (data.SiteName === zone) {
          return attentionCityData.push(data);
        }
      });
      let zoneStore = JSON.stringify(attentionCityZone);
      localStorage.setItem('zone', zoneStore);
      createAttention(attentionCityData);
      console.log(attentionCityData);
    }
    function deleteAttention(zone) {
      console.log(zone);
      attentionCityZone.forEach((el, index) => {
        if (el === zone) {
          attentionCityZone.splice(index, 1);
        }
      });
      console.log(attentionCityZone);
      attentionCityData.forEach((data, index) => {
        if (data.SiteName === zone) {
          attentionCityData.splice(index, 1);
        }
      });
      let zoneStore = JSON.stringify(attentionCityZone);
      localStorage.setItem('zone', zoneStore);
      createAttention(attentionCityData);
    }
    function createAttention(storageData) {
      let attentionList = document.querySelector('#attentionList');
      let newLi = '';
      for (let i = 0; i < storageData.length; i++) {
        let attentionData = storageData;
        newLi += `
        <li class="card">
        <span class="star-icon"><i class="fas fa-star"></i></span>
        <div class="location" ><span class="city">${attentionData[i].County}</span> - <span class="zone">${
          attentionData[i].SiteName
          }</span></div>
        <ul class="info">
          <li>AQI 指數: <span class="AQI">${attentionData[i].AQI}</span></li>
          <li>PM2.5: ${attentionData[i]['PM2.5']}</li>
          <li>狀態: ${attentionData[i].Status}</li>
          <li>更新時間: ${attentionData[i].PublishTime}</li>
        </ul>
      </li>`;
      }
      attentionList.innerHTML = newLi;
      statusColor();
    }
    function createCard(data) {
      let newCard = '';
      for (let i = 0; i < data.length; i++) {
        newCard += `
      <li class="card">
            <span class="star-icon"><i class="far fa-star"></i></span>
            <div class="location" ><span class="city">${data[i].County}</span> - <span class="zone">${
          data[i].SiteName
          }</span></div>
            <ul class="info">
              <li>AQI 指數: <span class="AQI">${data[i].AQI}</span></li>
              <li>PM2.5: ${data[i]['PM2.5']}</li>
              <li>狀態: ${data[i].Status}</li>
              <li>更新時間: ${data[i].PublishTime}</li>
            </ul>
          </li>`;
      }
      contentList.innerHTML = newCard;
      statusColor();
    }
  }
  function getCity(res) {
    let county = [];
    for (let i = 0; i < res.length; i++) {
      county.push(res[i].County);
    }
    let citySelect = document.querySelector('#city_select');
    let city = county.filter((el, index, arr) => {
      return arr.indexOf(el) === index;
    });
    for (let j = 0; j < city.length; j++) {
      let newOption = document.createElement('option');
      newOption.value = city[j];
      newOption.textContent = city[j];
      citySelect.appendChild(newOption);
    }
  }
  //根據狀態變換顏色
  function statusColor() {
    let contentAQI = document.querySelectorAll('.AQI');
    for (let i = 0; i < contentAQI.length; i++) {
      let aqi = Number(contentAQI[i].textContent);
      let location = contentAQI[i].parentNode.parentNode.parentNode.children[1];
      if (aqi < 50) {
        location.style.backgroundColor = '#00e400';
      } else if (aqi < 100) {
        location.style.backgroundColor = '#ffff00';
      } else if (aqi < 150) {
        location.style.backgroundColor = '#ff7e00';
      } else if (aqi < 200) {
        location.style.backgroundColor = '#ff0000';
      } else if (aqi < 300) {
        location.style.backgroundColor = 'rgb(143, 63, 151)';
        location.style.color = 'white';
      } else {
        location.style.backgroundColor = '#7e0023';
        location.style.color = 'white';
      }
    }

  }
})();
