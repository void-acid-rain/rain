
const MODEL_URL = '/weights';
const video = document.querySelector('#video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
]).then(startVideo)

// 웹 캠 실행
function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {

  // 인식된 얼굴을 출력할 canvas 선언
  const canvas = faceapi.createCanvasFromMedia(video);
  canvas.style.background = './assets/taebo1-unscreen.gif';
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections 
      = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()

        try {
          const nose = detections[0].landmarks.getNose();
          const unshiftNose = detections[0].unshiftedLandmarks.getNose();
          nose.push(nose[0]);
          unshiftNose.push(unshiftNose[0]);
      
          // 화면에 나타낼 얼굴 랜드마크를 코 부분만으로 재할당
          detections[0].landmarks._positions = nose;
          detections[0].unshiftedLandmarks._positions = unshiftNose;
      
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      
          // 인식된 얼굴 박스 그리기
          faceapi.draw.drawDetections(canvas, resizedDetections);
      
          // 얼굴 랜드마크 그리기(현재는 코만)
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      
          // 인식된 예상 기분 표시하기
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        } catch {}


  }, 100)
})