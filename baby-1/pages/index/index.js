//index.js
//获取应用实例
const app = getApp() //全局对象

Page({
  data: {
    name: 'xxx'
  },
  onClick: function(){
    this.setData({
      name: app.globalData.name
    })
  },
  onJump: function(){
    wx.redirectTo({
      url: '/pages/second/second',
    })
  }
})
