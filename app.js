import OxExperience from "./js/ox-experience.js";
import OxExperienceUI from "./js/ox-experience-ui.js";

class MainApp {

    previousTouch = null;
    oxExp = {};
    oxUI = {};

    constructor() {
        // Event listeners
        window.addEventListener('touchstart', this.onTouchStart);
        window.addEventListener('touchmove', this.onTouchMove);
        window.addEventListener('touchend', this.onTouchEnd);

        this.oxExp = new OxExperience();
        this.oxUI = new OxExperienceUI();
    }

    start() {
        console.log("App has started...");

        this.oxUI.init(this.oxExp);

        this.oxExp
            .init()
            .then(() => {
                this.oxUI.hideLoading();
            })
            .catch((error) => {
                console.error("Error initializing Onirix SDK", error);
                this.oxUI.showError("Initialization Error", error.message);
            });

        this.oxExp.onHitTest(() => {
            if (!this.oxExp.isCarPlaced()) {
                this.oxUI.showControls();
            }
        });
    }

    onTouchStart(event) {
        if (event.touches.length === 1) {
            this.previousTouch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }
    }

    onTouchMove(event) {
        if (event.touches.length === 1 && this.previousTouch) {
            const touch = event.touches[0];
            const deltaX = touch.clientX - this.previousTouch.x;
            const deltaY = touch.clientY - this.previousTouch.y;

            // Update cube rotation based on touch movement
            cube.rotation.y += deltaX * 0.01; // Adjust sensitivity as needed
            cube.rotation.x += deltaY * 0.01;

            // Update previous touch position
            this.previousTouch = { x: touch.clientX, y: touch.clientY };
        }
    }

    onTouchEnd() {
        this.previousTouch = null; // Reset on touch end
    }
}

const app = new MainApp();
app.start();