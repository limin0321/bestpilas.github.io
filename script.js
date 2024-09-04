document.addEventListener("DOMContentLoaded", function () {
    const flame = document.querySelector(".flame");
    let flameOpacity = 1;

    // ตัวแปรที่ใช้ในการตรวจจับเสียงจากไมโครโฟน
    let audioContext;
    let micStream;
    let analyser;
    const blowThreshold = 110;

    // ฟังก์ชันเริ่มต้นการตรวจจับการเป่า
    function startBlowDetection() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                audioContext = new AudioContext();
                micStream = stream;
                const microphone = audioContext.createMediaStreamSource(stream);

                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                microphone.connect(analyser);

                listenForBlow();
            })
            .catch(function (err) {
                console.error('Error accessing microphone:', err);
            });
    }

    // ฟังก์ชันตรวจจับการเป่า
    function listenForBlow() {
        const buffer = analyser.frequencyBinCount;
        const data = new Uint8Array(buffer);

        function detectBlow() {
            analyser.getByteFrequencyData(data);

            let sum = 0;
            for (let i = 0; i < buffer; i++) {
                sum += data[i];
            }
            const averageAmplitude = sum / buffer;

            if (averageAmplitude > blowThreshold) {
                flameOpacity -= 0.05;
                if (flameOpacity < 0) {
                    flameOpacity = 0;
                }
                flame.style.opacity = flameOpacity;
            }

            requestAnimationFrame(detectBlow);
        }

        detectBlow();
    }

    // เริ่มการตรวจจับการเป่าเมื่อหน้าเว็บโหลดเสร็จ
    startBlowDetection();

    // ฟังก์ชันจัดการเมื่อผู้ใช้ปิดหน้าเว็บ
    window.addEventListener("beforeunload", function () {
        if (audioContext) {
            audioContext.close();
            micStream.getTracks().forEach(track => track.stop());
        }
    });
});