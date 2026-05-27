document.addEventListener("DOMContentLoaded", () => {
    // 1. Dark Mode Toggle
    const themeBtn = document.getElementById("themeToggle");
    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        themeBtn.innerText = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    });

    // 2. Camera & AI Scanning Logic
    const video = document.getElementById("camera");
    const canvas = document.getElementById("canvas");
    const startCamBtn = document.getElementById("startCam");
    const captureBtn = document.getElementById("captureBtn");
    const fileUpload = document.getElementById("fileUpload");
    const resultBox = document.getElementById("resultBox");

    let stream = null;

    startCamBtn.addEventListener("click", async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = stream;
            captureBtn.disabled = false;
            startCamBtn.innerText = "Camera Active";
        } catch (err) {
            alert("Camera access denied or unavailable.");
        }
    });

    // Send Image to Flask backend
    const analyzeImage = async (base64Image) => {
        captureBtn.innerText = "Analyzing...";
        try {
            const res = await fetch('/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image })
            });
            const data = await res.json();
            
            resultBox.classList.remove("hidden");
            document.getElementById("resStatus").innerText = data.status;
            document.getElementById("resStatus").className = data.color_class === 'danger' ? 'status-danger' : 
                                                             data.color_class === 'warning' ? 'status-warning' : 'status-safe';
            document.getElementById("resConf").innerText = data.confidence;
            document.getElementById("resMsg").innerText = data.recommendation;
        } catch (error) {
            console.error("Error analyzing:", error);
            alert("Error connecting to AI engine.");
        }
        captureBtn.innerText = "Scan Water";
    };

    // Capture from Camera
    captureBtn.addEventListener("click", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        const base64Img = canvas.toDataURL("image/jpeg");
        analyzeImage(base64Img);
    });

    // Upload from File
    fileUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => analyzeImage(event.target.result);
            reader.readAsDataURL(file);
        }
    });

    // 3. Simple NGO Database Logic (No GPS required)
    const ngoDatabase = {
        "Andhra Pradesh": {
            "Visakhapatnam": [
                { name: "Clean Water AP", phone: "1800-111-222", support: "Water testing, Filtration kits" }
            ],
            "Vijayawada": [
                { name: "SafeAqua Foundation", phone: "1800-333-444", support: "Emergency clean water tanks" }
            ]
        },
        "Maharashtra": {
            "Mumbai": [
                { name: "Mumbai Jal Rakshak", phone: "1800-555-666", support: "Pollution reporting, River cleaning" }
            ]
        }
    };

    const stateSelect = document.getElementById("stateSelect");
    const citySelect = document.getElementById("citySelect");
    const ngoResult = document.getElementById("ngoResult");

    // Populate States
    for (let state in ngoDatabase) {
        let opt = document.createElement("option");
        opt.value = opt.innerText = state;
        stateSelect.appendChild(opt);
    }

    stateSelect.addEventListener("change", function() {
        citySelect.innerHTML = '<option value="">Select City</option>';
        if (this.value) {
            citySelect.disabled = false;
            for (let city in ngoDatabase[this.value]) {
                let opt = document.createElement("option");
                opt.value = opt.innerText = city;
                citySelect.appendChild(opt);
            }
        } else {
            citySelect.disabled = true;
        }
    });

    citySelect.addEventListener("change", function() {
        const state = stateSelect.value;
        const city = this.value;
        ngoResult.innerHTML = "";
        
        if (state && city && ngoDatabase[state][city]) {
            ngoDatabase[state][city].forEach(ngo => {
                ngoResult.innerHTML += `
                    <div class="glass-card" style="padding:1rem; margin-top:10px;">
                        <h4>${ngo.name}</h4>
                        <p>📞 ${ngo.phone}</p>
                        <p>🛠 ${ngo.support}</p>
                    </div>
                `;
            });
        }
    });
});