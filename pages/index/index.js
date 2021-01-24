//index.js
//获取应用实例
const app = getApp()
var getHot=function(t){
  var url ="https://node.huokele.com/translate/lang/hot";
  wx.request({
    url: url,
    success: function (res) {
      //console.log(res);
        t.setData({
          hot: res.data.data
        });
      }
  })
};
var getlangs = function (t) {
  var url = "https://node.huokele.com/translate/lang/list";
  wx.request({
    url: url,
    success: function (res) {
      var sp=0;
      var langs=[];
      for (var i in res.data.data ){
        var m = sp>2?0:1;
        var tmp = { on: m, key:i,val: res.data['data'][i]}
        langs.push(tmp);
        sp++;
      }
      t.setData({
        langs: langs,
      });
      //console.log(langs);
    }
  })
};



Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    logosrc:'../images/logo.png',
    hot:null,
    langs:null,
    ons:"hhh",
    showPage2:false,
    keyword:"",
    focus:true,
    aims:[],
    issend:false,
    xx:"",
    copyBtn:false,
    isBaiduLimit:false,
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  
  onLoad: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
    getHot(this);
    getlangs(this);
    this.setData({
      hot: app.globalData.hot
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    //console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  copyResult:function(e){
    var self = this;
    var data = self.data.aims;
    if(data==""){
      wx.showToast({
        title: '请输入要翻译的文本',
      })
      return false;
    }else{
    wx.setClipboardData({
      data: data.toString(),
      success: function (res) {
        // self.setData({copyTip:true}),  
        wx.showToast({
          title: '复制成功',
        })
        /*wx.showModal({
          title: '提示',
          content: '复制成功',
          success: function (res) {
            if (res.confirm) {
              console.log('确定')
            } else if (res.cancel) {
              console.log('取消')
            }
          }
        }) */
      }
    });  
    }
   
  },
  gotoPage2:function(e){
    //console.log(e.target);
    if(this.data.isBaiduLimit){
      wx.showToast({
        title: "因系统升级,暂无法翻译多目标语言，于8.1日恢复",
        icon: 'none',
        duration: 5000
      });
    }

    var keyword = this.data.keyword;
    if (e.target.dataset.val!=undefined){
      keyword = e.target.dataset.val;
    }
    this.setData({
      showPage2: true,
      keyword:keyword,
    })
  },
  clearkey:function(){
    this.setData({
      keyword: "",
      focus:true,
    })
  },
  bindKeyInput: function (e) {
    this.setData({
      keyword: e.detail.value
    })
  },
  selectLang:function(e){
    var _index = e.target.dataset.index;
   // var aim = this.langs[aim];
    
    var langdata = this.data.langs;
    //console.log(langdata);
    if(this.data.isBaiduLimit){//百度限制
      for(var i in langdata){
        if(i==_index){
          langdata[i]['on'] = langdata[_index]['on']>0?0:1;
        }else{
          langdata[i]['on']=0;
        }
      }
    }else{
      langdata[_index]['on'] = langdata[_index]['on']>0?0:1;
    }

    this.setData({
      langs: langdata
    })
  },
  getResult: function (e) {
    var isOk=true;
    var issend = this.data.issend;
    if (issend) return false;
    var that = this;
    var url = "https://node.huokele.com/translate/lang/result";
    var keyword=this.data.keyword;
    var langdata = this.data.langs;
    var sp=[];
    for(var i in langdata){
      if (langdata[i]['on']==1){
        sp.push(langdata[i]['key']);
      }
    }
    var langs=sp.join('&');
    if(keyword==""){
      isOk = false;
      showModal("提示","请输入要翻译的文本");
      
    }
    if(langs==""){
      isOk = false;
      showModal("提示", "请选择目标语言");
     
    }
    if(!isOk) return false;
    wx.request({
      url: url,
      method:"post",
      data: {
        query:keyword,
        langs:langs,
      },
      success:function(res){
        if(res.data!==""){
          that.setData({
              aims:res.data.data,
              copyBtn:true,
          });
        }
      }
    })

  }
})

function showModal(title,content){
  wx.showModal({
    title: title,
    content: content,
    showCancel:false,
    success: function (res) {
      return false;
      if (res.confirm) {
        //console.log('用户点击确定')
      } else if (res.cancel) {
        //console.log('用户点击取消')
      }
    }
  })

}
