// pages/edit/edit.js
const app = getApp() //全局对象
let cfg = {
  img: {},
  scale: 1  //默认不缩放
}  //全局配置对象
let SCALE = { //常量
  MAX: 2,
  MIN: 0.3
}
Page({

  /**
   * 页面的初始数据 素材图片
   */
  data: {
    images: [{
      img: '../../img/clothes0.png'
    },{
      img: '../../img/clothes1.png'
    },{
      img: '../../img/hair0.png'
    },{
      img: '../../img/hair1.png'
    },{
      img: '../../img/shoe1.png'
    },{
      img: '../../img/shoe2.png'
    }],
    canvasWidth: 0,
    canvasHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setCanvasSize();
  },
  //图片自适应画布
  setCanvasSize: function(){
    var imgFile = app.globalData.imgFile;
    console.log("edit::",imgFile)
    var self = this;

    //取到画布信息
    wx.createSelectorQuery().select("#edit-editor").boundingClientRect(function(wrapper){
      var _canvasWidth = 0, _canvasHeight = 0;
      wx.getImageInfo({
        src: imgFile.tempFilePaths[0],
        success(res) {
          var originalWidth = res.width;
          var originalHeight = res.height;
          //图片比例 画布比例
          if (originalHeight/originalWidth > wrapper.height/wrapper.width) {
            _canvasHeight = wrapper.height;
            _canvasWidth = originalWidth * _canvasHeight/originalHeight;
          } else {
            _canvasWidth = wrapper.width;
            _canvasHeight = originalHeight * _canvasWidth/originalWidth;
          }

          //保存缩放后的宽高
          self.setData({
            canvasHeight: _canvasHeight,
            canvasWidth: _canvasWidth
          })

          //绘制图片
          var ctx = wx.createCanvasContext("editor");
          ctx.drawImage(imgFile.tempFilePaths[0], 0, 0, _canvasWidth, _canvasHeight);
          ctx.draw();
        }
      })
    }).exec();

    
  },

  // 点击图片素材
  onTapImgMaterial: function(event){
    console.log(event.currentTarget.dataset.index);
    this.drawImgMaterial(event.currentTarget.dataset.index);
  },
  // 绘制图片素材
  drawImgMaterial: function(index){
    var images = this.data.images;
    var imgFile = app.globalData.imgFile;
    var self = this;

    var ctx = wx.createCanvasContext("editor");
    wx.getImageInfo({
      src: images[index].img,
      success(res) {
        var width = cfg.img.originalWidth = res.width;
        var height = cfg.img.originalHeight = res.height;
        //将素材保存
        cfg.img.origin = images[index].img;
        //初始化坐标
        cfg.img.x = 0;
        cfg.img.y = 0;

        //绘制上传的图片
        ctx.drawImage(imgFile.tempFilePaths[0], 0, 0, 
          self.data.canvasWidth, self.data.canvasHeight);
        //绘制选中图片素材
        ctx.drawImage(images[index].img, 0, 0, 100, 100 * height/width);
        ctx.draw();
      }
    })
    
  },

  startMove: function(event) {
    var touchPoint = event.touches[0];
    var x = cfg.img.x;
    var y = cfg.img.y;
    
    cfg.offsetX = touchPoint.clientX - x;  //解决图片跳问题
    cfg.offsetY = touchPoint.clientY - y;
  },

  startZoom: function(event){
    var xLen = event.touches[1].clientX - event.touches[0].clientX;
    var yLen = event.touches[1].clientY - event.touches[0].clientY;
    //2指距离
    cfg.initDistance = Math.sqrt(xLen*xLen + yLen*yLen);
  },

  //触摸开始
  onTouchStart: function(event) {
    if (event.touches.length == 1) {
      this.startMove(event);
    }
    if (event.touches.length > 1) {
      this.startZoom(event);
    }
  },
  //触摸移动
  onTouchMove: function(event){
    if (event.touches.length == 1) {
      this.move(event);
    }
    if (event.touches.length > 1) {
      this.zoom(event);
    }
  },
  //释放
  onTouchEnd: function(){
    
  },

  //缩放
  zoom: function(event) {
    var xLen = event.touches[1].clientX - event.touches[0].clientX;
    var yLen = event.touches[1].clientY - event.touches[0].clientY;
    //2指距离
    cfg.curDistance = Math.sqrt(xLen*xLen + yLen*yLen);

    //计算缩放比例
    cfg.scale = cfg.scale + 0.001 * (cfg.curDistance - cfg.initDistance);
    cfg.scale = Math.min(cfg.scale, SCALE.MAX);
    cfg.scale = Math.max(cfg.scale, SCALE.MIN);

    var imgWidth = 100 * cfg.scale;
    var imgHeight = imgWidth * cfg.img.originalHeight/cfg.img.originalWidth;

    var ctx = wx.createCanvasContext("editor");
    var imgFile = app.globalData.imgFile;
    ctx.drawImage(imgFile.tempFilePaths[0], 0, 0, 
      this.data.canvasWidth, this.data.canvasHeight);
    //绘制选中图片素材
    ctx.drawImage(cfg.img.origin, cfg.img.x, cfg.img.y, imgWidth, imgHeight);
    ctx.draw();
  },

  move: function(event) {
    var touchPoint = event.touches[0];

    var x = touchPoint.clientX - cfg.offsetX;
    var y = touchPoint.clientY - cfg.offsetY;
    cfg.img.x = x;
    cfg.img.y = y;
    var imgWidth = 100 * cfg.scale;
    var imgHeight = imgWidth * cfg.img.originalHeight/cfg.img.originalWidth;

    var ctx = wx.createCanvasContext("editor");
    var imgFile = app.globalData.imgFile;
    ctx.drawImage(imgFile.tempFilePaths[0], 0, 0, 
      this.data.canvasWidth, this.data.canvasHeight);
    //绘制选中图片素材
    ctx.drawImage(cfg.img.origin, x, y, imgWidth, imgHeight);
    ctx.draw();
  },

  //保存编辑后的图片
  savePic: function(){
    wx.canvasToTempFilePath({
      width: 300,
      height: 300,
      destWidth: 600,
      destHeight: 600,
      canvasId: "editor",
      success: function(res){
        console.log(res.tempFilePath)
        //将临时图片保存到相册
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function(){
            wx.showToast({
              title: '保存成功',
            })
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})