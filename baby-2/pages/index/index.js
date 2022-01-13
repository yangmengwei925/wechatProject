//index.js
//获取应用实例
const app = getApp() //全局对象

Page({
  data: {
    name: 'xxx'
  },
  onUpload: function() {
    wx.chooseImage({
      count: 1,  //默认选择一张
      sourceType: ['album', 'camera'], //相册 相机
      sizeType: ['compressed', 'original'], //压缩 原始
      success: function(res) {
        console.log(res)
      }
    })
  }
})
