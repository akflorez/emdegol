const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
    console.log("Installing dependencies (puppeteer, ffmpeg-static)...");
    try {
        execSync("npm install puppeteer ffmpeg-static --no-audit --no-fund", { stdio: 'inherit' });
        console.log("Dependencies installed successfully.");
    } catch (err) {
        console.error("Failed to install dependencies:", err);
        process.exit(1);
    }

    const puppeteer = require('puppeteer');
    const ffmpegPath = require('ffmpeg-static');

    console.log(`Using FFmpeg binary at: ${ffmpegPath}`);

    const tempDir = path.join(__dirname, 'temp_frames');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    } else {
        // Clear old frames
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
            fs.unlinkSync(path.join(tempDir, file));
        }
    }

    console.log("Launching headless browser...");
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set 1280x720 HD viewport (fits WhatsApp limits and keeps size small)
    await page.setViewport({ width: 1280, height: 720 });

    console.log("Navigating to http://localhost:9000...");
    await page.goto('http://localhost:9000', { waitUntil: 'networkidle2' });

    // Stop the default automatic interval in script.js to avoid double slide transitions
    await page.evaluate(() => {
        let id = window.setInterval(() => {}, 0);
        while (id--) {
            window.clearInterval(id);
        }
    });

    const fps = 15; // 15 frames per second is very smooth for CSS transitions and keeps compile fast
    const slideDurationSec = 6; // 6 seconds per slide so viewers have time to read
    const totalSlides = 6; // 0: Podium, 1: Lina, 2: Jennifer, 3: Jhoan, 4: Marcador, 5: Agradecimientos
    const durationSec = totalSlides * slideDurationSec;
    const totalFrames = durationSec * fps;
    const frameDelay = 1000 / fps;

    console.log(`Recording started: capturing ${totalFrames} frames at ${fps} FPS (${durationSec}s total)...`);

    const startTime = Date.now();
    for (let i = 0; i < totalFrames; i++) {
        // Calculate which slide should be active at this frame
        const currentSec = i / fps;
        const slideIndex = Math.floor(currentSec / slideDurationSec);

        await page.evaluate((idx) => {
            const slides = document.querySelectorAll('.tv-slide');
            const header = document.querySelector('.tv-header');
            
            slides.forEach((slide, sIdx) => {
                if (sIdx === idx) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            // Toggle header visibility (hide on Slide 5)
            if (header) {
                if (idx === 5) {
                    header.style.display = 'none';
                } else {
                    header.style.display = 'flex';
                }
            }
        }, slideIndex);

        // Capture frame
        const frameName = `frame_${String(i).padStart(5, '0')}.png`;
        await page.screenshot({ path: path.join(tempDir, frameName), type: 'png' });

        // Throttle to target FPS
        const elapsed = Date.now() - startTime;
        const targetElapsed = (i + 1) * frameDelay;
        const delay = targetElapsed - elapsed;
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        if ((i + 1) % 50 === 0 || i === totalFrames - 1) {
            console.log(`Captured frame ${i + 1}/${totalFrames}...`);
        }
    }

    await browser.close();
    console.log("Screenshots captured. Compiling to video using FFmpeg...");

    const outputVideo = path.join(__dirname, 'emdegol_finalistas.mp4');
    if (fs.existsSync(outputVideo)) {
        fs.unlinkSync(outputVideo);
    }

    try {
        // Compile PNGs to MP4 video using libx264 compression with YUV420p pixel format (highly compatible with WhatsApp)
        const cmd = `"${ffmpegPath}" -y -framerate ${fps} -i "${path.join(tempDir, 'frame_%05d.png')}" -c:v libx264 -pix_fmt yuv420p -crf 23 -vf "scale=1280:720" "${outputVideo}"`;
        execSync(cmd, { stdio: 'inherit' });
        console.log(`Video generated successfully: ${outputVideo}`);
        
        // Clean up temp frames directory
        console.log("Cleaning up temp frames...");
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
            fs.unlinkSync(path.join(tempDir, file));
        }
        fs.rmdirSync(tempDir);
        console.log("Clean up finished.");
    } catch (err) {
        console.error("FFmpeg compilation failed:", err);
    }
}

main().catch(console.error);
