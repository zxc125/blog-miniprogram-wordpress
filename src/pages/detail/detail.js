Page({
  data: {
    article: {},
    articleId: null,
    viewCount: 0,

    currentPage: 1,
    totalPage: null,
    total: null,
    commentList: [],
    noMore: false
  },

  onLoad ({ id }) {
    wx.showShareMenu()
    this.setData({
      articleId: id
    })
    this.getDetail(id)
    this.getCommentList(id)
    this.updateViewCount(id)
  },

  async onReachBottom () {
    this.setData({
      currentPage: this.data.currentPage + 1
    })
    this.getCommentList(this.data.articleId)
  },

  async getDetail (id) {
    wx.showLoading({
      title: '加载中...'
    })
    let { data } = await wx.$request.get(`/wp-json/wp/v2/posts/${id}`)
    wx.hideLoading()
    const content = data.content.rendered
      .replace(/<img/gi, '<img style="max-width:100%;height:auto;"')
      .replace(/<code/gi, '<code class="code"')
      .replace(/<pre/gi, '<pre style="overflow:scroll;margin: 10px 0;padding: 10px;background: #f8f8f8;border-radius: 5px;"')
      .replace(/<blockquote/gi, '<blockquote class="blockquote"')
      .replace(/<h2/gi, '<h2 class="content-title"')
      .replace(/<a/gi, '<a bindtap="test"')

    this.setData({
      article: {
        ...data,
        date: data.date.replace('T', ' '),
        author: data.articleInfor.author,
        authorPic: data.articleInfor.other.authorPic,
        commentCount: data.articleInfor.commentCount,
        goodCount: data.articleInfor.xmLike.very_good,
        content
      }
    })
  },

  async getCommentList (id) {
    if (this.data.totalPage && this.data.currentPage > this.data.totalPage) {
      this.setData({
        noMore: true
      })
      return
    }
    wx.showLoading({
      title: '加载中...'
    })
    let { data, header } = await wx.$request.get('/wp-json/wp/v2/comments', {
      data: {
        post: id,
        page: this.data.currentPage
      }
    })
    wx.hideLoading()
    this.setData({
      commentList: data,
      total: +header['X-WP-Total'],
      totalPage: +header['X-WP-TotalPages']
    })
  },

  async updateViewCount (id) {
    let { data } = await wx.$request.post('/wp-json/xm-blog/v1/view-count', {
      data: {
        id
      }
    })
    this.setData({
      viewCount: data
    })
  }
})