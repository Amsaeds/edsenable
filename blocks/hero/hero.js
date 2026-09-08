/*
 * Hero block
 * Default hero (image background) is auto-blocked and needs no JS.
 *
 * The `video-background` variant (authored as "Hero (video-background)")
 * lets an author provide a link to a video file (e.g. an .mp4). This
 * decoration replaces that link with a muted, looping, autoplaying
 * background <video>, sitting behind the hero content just like the
 * default image background.
 */

const VIDEO_EXT = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

function buildBackgroundVideo(src) {
  const video = document.createElement('video');
  video.className = 'hero-video';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = true;
  // preload metadata only; the video decorates below LCP-critical content
  video.preload = 'auto';
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('tabindex', '-1');

  const source = document.createElement('source');
  source.src = src;
  video.append(source);

  // ensure autoplay kicks in across browsers
  video.addEventListener('canplay', () => {
    const playing = video.play();
    if (playing && typeof playing.catch === 'function') {
      playing.catch(() => { /* autoplay blocked; leave paused */ });
    }
  });

  return video;
}

export default function decorate(block) {
  if (!block.classList.contains('video-background')) return;

  // find an authored link that points at a video file
  const videoLink = [...block.querySelectorAll('a[href]')]
    .find((a) => VIDEO_EXT.test(a.getAttribute('href')));
  if (!videoLink) return;

  const video = buildBackgroundVideo(videoLink.getAttribute('href'));

  // remove the authored link (and its now-empty wrapper) and mount the video
  const wrapper = videoLink.closest('p') || videoLink;
  wrapper.remove();
  block.prepend(video);
}
