// infinite-voz.js
// ==UserScript==
// @name         Infinite Scroll VOZ V2
// @namespace    https://voz.vn
// @version      2.2
// @description  try to take over the world!
// @author       Ninh Pham (ReeganExE), Nguyen Duy Tiep (green-leaves)
// @match        https://voz.vn/t/*
// @grant        GM_addStyle
// ==/UserScript==
GM_addStyle(`
.hide {display: none} .show{display: block}
.fixed-page {
    position: fixed;
    left: 13px;
    bottom: 20px;
}

.reply-form.hide .message-cell--main {
  display: none;
}
.reply-form {
    position: fixed;
    bottom: 20px;
    z-index: 100;
    width: 0;
    border: solid 1px #616161;
    box-shadow: 1px 1px 10px 4px #585858;
    border-radius: 2px;
    -webkit-transition: width .2s ease-in-out;
    -moz-transition: width .2s ease-in-out;
    -o-transition: width .2s ease-in-out;
    transition: width .2s ease-in-out;
}

.reply-button {
  position: fixed;
  bottom: 38px;
  z-index: 100;
  right: 140px;
}
`)
;(function () {
  const PAGE_WRAPPER_SELECTOR = '.pageNavWrapper.pageNavWrapper--mixed'
  const POST_BODY_SELECTOR = '.lbContainer .block-body'
  const parser = new DOMParser()
  const threads = document.getElementById('posts')
  const posts = document.querySelector(POST_BODY_SELECTOR)
  let currentPage = +getCurrentPage()
  let lastPage = +getLastPage()
  let isLoading = false
  const PAGE_REG = /Page \d+/
  const BUFFER_HEIGHT = 300 // Magic number, to load next page before reach the end.
  const loadingSpinHTML =
    '<div class="" style="width: 160px;margin: 0 auto;padding: 20px;text-align: center;color: white;">Loading... <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="/></div>'
  const loadingSpin = document.createElement('div')
  loadingSpin.innerHTML = loadingSpinHTML
  loadingSpin.className = 'hide'

  const pageNavWrappers = document.querySelectorAll(PAGE_WRAPPER_SELECTOR)
  if (pageNavWrappers.length) {
    pageNavWrappers[pageNavWrappers.length - 1].classList.add('fixed-page')
  }

  // Reply form
  const repyForm = document.querySelector('form.js-quickReply')
  if (repyForm) {
    repyForm.classList.add('reply-form')
    repyForm.classList.add('hide')

    // Reply button
    const replyButton = htmlToElement(`
      <button type="button" class="button--primary button button--icon button--icon--reply reply-button">
        <span class="button-text">
          Reply
        </span>
      </button>
    `)

    let show = false

    replyButton.addEventListener('click', () => {
      const post = document.querySelector('.message.message--post.js-post.js-inlineModContainer')
      show = !show
      if (show) {
        repyForm.classList.remove('hide')
        repyForm.style.width = `${post.clientWidth}px`
      } else {
        repyForm.addEventListener(
          'transitionend',
          () => {
            repyForm.classList.add('hide')
          },
          { once: true }
        )
        repyForm.style.width = 0
      }
    })
    document.body.appendChild(replyButton)
  }

  //= =========================================================================
  // Load Thread
  // UNSUPPORTED AT THIS MOMENT
  //= =========================================================================
  if (threads) {
    const boxId = getParameterByName('f', window.location.href)
    const innerThreadList = document.getElementById(`threadbits_forum_${boxId}`)
    const threadListOffsetTop = getCoords(threads).top

    insertAfter(threads, loadingSpin)
    window.addEventListener('scroll', function () {
      if (
        window.scrollY + window.innerHeight + BUFFER_HEIGHT >=
        threads.offsetHeight + threadListOffsetTop
      ) {
        if (isLoadable()) {
          loadingSpin.className = 'show'
          isLoading = true
          loadBoxPage(boxId, ++currentPage, function (loadedDoc) {
            pushState(currentPage)
            innerThreadList.innerHTML += `<div>Page${currentPage}</div>`
            innerThreadList.innerHTML += loadedDoc.getElementById(
              `threadbits_forum_${boxId}`
            ).innerHTML
            lastPage = getLastPage(loadedDoc)
            updatePageNavigator(loadedDoc.querySelector('div.pagenav').innerHTML)
            isLoading = false
            loadingSpin.className = 'hide'
          })
        }
      }
    })
    //= =========================================================================
    // Load Post
    //= =========================================================================
  } else if (posts) {
    const postsOffsetTop = getCoords(posts).top

    const [, threadId] = location.href.match(/https:\/\/voz.vn\/t.*\.(\d+)\/?/)
    insertAfter(posts, loadingSpin)
    window.addEventListener('scroll', function () {
      if (
        window.scrollY + window.innerHeight + BUFFER_HEIGHT >=
        posts.offsetHeight + postsOffsetTop
      ) {
        if (isLoadable()) {
          loadingSpin.className = 'show'
          isLoading = true
          loadThreadPage(threadId, ++currentPage, function (loadedDoc) {
            pushState(currentPage)
            posts.innerHTML += loadedDoc.querySelector(POST_BODY_SELECTOR).innerHTML
            updatePageNavigator(loadedDoc)
            lastPage = getLastPage(loadedDoc)
            isLoading = false
            loadingSpin.className = 'hide'

            // Reintialize the events handler for quotes, reply, report, reaction
            XF.activate(posts)
          })
        }
      }
    })
  }

  function pushState(currentPage) {
    let { title } = document

    if (PAGE_REG.test(title)) {
      title = title.replace(PAGE_REG, `Page ${currentPage}`)
    } else {
      title = `${title} Page ${currentPage}`
    }

    let [root] = location.href.split('/page-')
    if (!root.endsWith('/')) {
      root += '/'
    }
    root += `page-${currentPage}`
    history.pushState({}, title, root + location.search)
    document.title = title
  }

  function isLoadable() {
    return !isLoading && currentPage < lastPage
  }

  function getCurrentPage() {
    const page = document.querySelector('.pageNav-page.pageNav-page--current a')
    return page ? page.textContent.trim() : 1
  }

  function updatePageNavigator(loadedDoc) {
    const pageNavs = document.querySelectorAll(PAGE_WRAPPER_SELECTOR)
    const newHtmlNav = loadedDoc.querySelector(PAGE_WRAPPER_SELECTOR).innerHTML
    for (let i = 0; i < pageNavs.length; i++) {
      pageNavs[i].innerHTML = newHtmlNav
    }
  }

  function getLastPage(doc) {
    if (!doc) doc = document
    const page = doc.querySelector('.pageNav-main li:last-child')
    return page ? page.innerText : 1
  }

  function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href
    }
    name = name.replace(/[[\]]/g, '\\$&')
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`)
    const results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }

  function getCoords(elem) {
    // crossbrowser version
    const box = elem.getBoundingClientRect()

    const { body } = document
    const docEl = document.documentElement

    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop
    const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft

    const clientTop = docEl.clientTop || body.clientTop || 0
    const clientLeft = docEl.clientLeft || body.clientLeft || 0

    const top = box.top + scrollTop - clientTop
    const left = box.left + scrollLeft - clientLeft

    return { top: Math.round(top), left: Math.round(left) }
  }

  function loadBoxPage(boxId, pageNo, callback) {
    ajax(
      'GET',
      `https://vozforums.com/forumdisplay.php?f=${boxId}&order=desc&page=${pageNo}`,
      loadSuccess
    )
    function loadSuccess(xhr) {
      callback(parser.parseFromString(xhr.responseText, 'text/html'))
    }
  }

  function loadThreadPage(threadId, pageNo, callback) {
    ajax('GET', `https://voz.vn/t/thread.${threadId}/page-${pageNo}`, (xhr) =>
      callback(parser.parseFromString(xhr.responseText, 'text/html'))
    )
  }

  function ajax(method, url, callback) {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)
    xhr.send(null)
    xhr.onreadystatechange = function () {
      const DONE = 4 // readyState 4 means the request is done.
      const OK = 200 // status 200 is a successful return.
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          callback(xhr)
        } else {
          console.log(`Error: ${xhr.status}`) // An error occurred during the request.
        }
      }
    }
  }

  function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
  }

  /**
   * @param {String} HTML representing a single element
   * @return {Element}
   * @author https://stackoverflow.com/a/35385518/1099314
   */
  function htmlToElement(html) {
    const template = document.createElement('template')
    html = html.trim() // Never return a text node of whitespace as the result
    template.innerHTML = html
    return template.content.firstChild
  }
})()
