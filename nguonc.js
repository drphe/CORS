const idIframe = "movie";
console.log("chen nguonc.js");

let isok = null;
isok = setInterval(() => {
    chenIframeMovie();
}, 1000);

// lấy tập phim lúc load trang
let tapId = getTapIdFromUrl();
let oldTitle = document.title;
function chenIframeMovie() {
    try {
        const movieIframe = document.getElementById(idIframe);
        if (movieIframe) return;
        const iframe = document.createElement('iframe');
        iframe.id = idIframe;
        iframe.width = '100%';
        iframe.height = '480';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.style.display = 'none';
        const card = document.querySelector('.card-collapse')
            if (!card) return;
            card?.appendChild(iframe);
        console.log("ok")
        isok = null;
    } catch (e) {
        console.error(e);
    }
}
function addTapParam(tapId) {
  const url = new URL(window.location.href);
  url.searchParams.set("tap", tapId); // thêm hoặc cập nhật param tap
  window.history.pushState({}, "", url); // cập nhật URL mà không reload
}
function getTapIdFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get("tap");
}

document.addEventListener("click", chenIframeMovie);

const observers = new MutationObserver((mutations, obs) => {
    const iframe = document.querySelector("iframe");
    const allLink = document.querySelectorAll('a.overflow-hidden');
    if (iframe && allLink) {
        // Khi iframe đã có mặt, chạy code
        document.querySelectorAll('a.overflow-hidden')?.forEach(link => {
            if (link.target) {
                link.removeAttribute("target");
                link.setAttribute("style", "display:inline-flex");
            }
            if (link.innerText == tapId) {
                showVideo(link);
                tapId = null; 
            }
            link.addEventListener('click', e => {
                e.preventDefault();
                showVideo(link);
            });
        });
        obs.disconnect(); // ngừng quan sát sau khi đã chạy
    }
});

observers.observe(document.body, { childList: true, subtree: true });

// hiển thị video theo nút bấm
function showVideo(source){
		if(!isok) chenIframeMovie();
                const url = source.getAttribute('href');
                document.querySelectorAll('a.overflow-hidden')?.forEach(a => {
                    a.style.background = ""
                });
                source.style.background = "rgb(139 92 246/var(--tw-text-opacity))";
        	const iframe =document.getElementById(idIframe);
        	if (!iframe) return;
                if (iframe.src !== url) {
                    iframe.src = url;
                    iframe.style.display = 'block';
		    addTapParam(source.innerText);
		    document.title = oldTitle + " - Tập " + source.innerText;
                }
                document.querySelector('.card-collapse')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
	    }
// Phím tắt F, ESC
document.addEventListener("keydown", function(e) {
  if (e.key === "f" || e.key === "F") {
    if (document.fullscreenElement) {
      // Nếu đang fullscreen thì thoát
      document.exitFullscreen();
    } else {
      // Nếu chưa fullscreen thì bật fullscreen cho iframe
      const iframe = document.getElementById(idIframe);console.log(iframe)
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.webkitRequestFullscreen) { // Safari
        iframe.webkitRequestFullscreen();
      } else if (iframe.msRequestFullscreen) { // IE/Edge cũ
        iframe.msRequestFullscreen();
      }
    }
  }
});


