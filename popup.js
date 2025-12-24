// document.addEventListener("DOMContentLoaded", function () {
//   const currentDomain = document.getElementById("currentDomain");
//   const brightnessValue = document.getElementById("brightnessValue");
//   const decreaseBtn = document.getElementById("decreaseBrightness");
//   const increaseBtn = document.getElementById("increaseBrightness");
//   const resetBtn = document.getElementById("resetBrightness");

//   let currentTab = null;

//   // 获取当前标签页的域名并显示
//   // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   //   if (tabs[0]) {
//   //     currentTab = tabs[0];
//   //     try {
//   //       const url = new URL(tabs[0].url);
//   //       const hostname = url.hostname;
//   //       currentDomain.textContent = hostname;

//   //       // 获取当前亮度值
//   //       getCurrentBrightness();
//   //     } catch (error) {
//   //       currentDomain.textContent = "无法获取域名";
//   //     }
//   //   } else {
//   //     currentDomain.textContent = "未找到活动标签页";
//   //   }
//   // });

//   // 获取当前亮度
//   // function getCurrentBrightness() {
//   //   if (!currentTab) return;

//   //   chrome.tabs.sendMessage(
//   //     currentTab.id,
//   //     { action: "getBrightness" },
//   //     function (response) {
//   //       if (response && response.brightness) {
//   //         updateBrightnessDisplay(response.brightness);
//   //       }
//   //     }
//   //   );
//   // }

//   // 更新亮度显示
//   function updateBrightnessDisplay(brightness) {
//   //   const percentage = Math.round(brightness * 100);
//   //   brightnessValue.textContent = percentage + "%";
//   // }

//   // 发送亮度控制消息
//   // function sendBrightnessMessage(action) {
//   //   if (!currentTab) return;

//   //   chrome.tabs.sendMessage(
//   //     currentTab.id,
//   //     { action: action },
//   //     function (response) {
//   //       if (response && response.brightness) {
//   //         updateBrightnessDisplay(response.brightness);
//   //       }
//   //     }
//   //   );
//   // }

// //   // 绑定按钮事件
// //   decreaseBtn.addEventListener("click", function () {
// //     sendBrightnessMessage("decreaseBrightness");
// //   });

// //   increaseBtn.addEventListener("click", function () {
// //     sendBrightnessMessage("increaseBrightness");
// //   });

// //   resetBtn.addEventListener("click", function () {
// //     sendBrightnessMessage("resetBrightness");
// //   });
// // });
