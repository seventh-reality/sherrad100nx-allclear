import { playAudio } from "./util.js";

export default class OxExperienceUI {
    _loadingScreen = null;
    _errorScreen = null;
    _errorTitle = null;
    _errorMessage = null;

    init(oxExp) {
        try {
            this._loadingScreen = document.querySelector("#loading-screen");
            this._errorScreen = document.querySelector("#error-screen");
            this._errorTitle = document.querySelector("#error-title");
            this._errorMessage = document.querySelector("#error-message");
            this._ins7 = document.querySelector("#ins7");
            
            this._transformControls = document.querySelector("#transform-controls");
            this._errorimg = document.querySelector("#errorimg");
            this._modelControls = document.querySelector("#model-controls");
            this._backbutton = document.querySelector("#back-button");
            this._insidebuttonscontrols = document.querySelector("#insidebuttons-controls");
            this._insidebuttonscontrols1 = document.querySelector("#insidebuttons-controls1");

            document.querySelector("#tap-to-place").addEventListener("click", () => {
                playAudio("assets/sounds/Feture.mp3");
                oxExp.placeCar();
                this._transformControls.style.display = "none";
                this._insidebuttonscontrols.style.display = "none";
                this._insidebuttonscontrols1.style.display = "none";
                this._backbutton.style.display = "none";
                this._modelControls.style.display = "flex";
            });

            document.querySelector("#model1").addEventListener("click", () => {
                oxExp.switchModel(0);
                playAudio("assets/sounds/afterf.mp3");

                document.getElementById('insidebuttons-controls').style.display = 'block';
                document.getElementById('insidebuttons-controls1').style.display = 'none';
                document.getElementById('back-button').style.display = 'block';
                document.getElementById('model-controls').style.display = 'none';
                document.getElementById('errorimg').style.display = 'none';

            });
            document.querySelector("#model2").addEventListener("click", () => {
                oxExp.switchModel(0);
                playAudio("assets/sounds/benfitf.mp3");

                document.getElementById('insidebuttons-controls1').style.display = 'flex';
                document.getElementById('insidebuttons-controls').style.display = 'none';
                document.getElementById('back-button').style.display = 'block';
                document.getElementById('model-controls').style.display = 'none';
                document.getElementById('errorimg').style.display = 'none';
                document.getElementById('ins7').style.display = 'none';


            });
            document.querySelector("#back").addEventListener("click", () => {
                oxExp.switchModel(0);
                // playAudio("");
                document.getElementById('insidebuttons-controls1').style.display = 'none';
                document.getElementById('insidebuttons-controls').style.display = 'none';
                document.getElementById('back-button').style.display = 'none';
                document.getElementById('model-controls').style.display = 'flex';
                document.getElementById('errorimg').style.display = 'none';
                document.getElementById('ins7').style.display = 'none';
                document.getElementById('ins4').style.display = 'block';

            });
            document.querySelector("#ins1").addEventListener("click", () => {
                oxExp.switchModel(0);
                playAudio("assets/sounds/Intro.mp3");
                document.getElementById('errorimg').style.display = 'none';
                document.getElementById('insidebuttons-controls').style.display = 'block';
                document.getElementById('insidebuttons-controls1').style.display = 'none';
                document.getElementById('back-button').style.display = 'block';


            });
            document.querySelector("#ins2").addEventListener("click", () => {
                oxExp.switchModel(1);
                playAudio("assets/sounds/parts.mp3");
                document.getElementById('errorimg').style.display = 'none';
                document.getElementById('insidebuttons-controls').style.display = 'block';
                document.getElementById('insidebuttons-controls1').style.display = 'none';
                document.getElementById('back-button').style.display = 'block';

            });
            document.querySelector("#ins3").addEventListener("click", () => {
                oxExp.switchModel(2);
                playAudio("assets/sounds/Usage.mp3");

                document.getElementById('errorimg').style.display = 'none';
                document.getElementById('insidebuttons-controls').style.display = 'block';
                document.getElementById('insidebuttons-controls1').style.display = 'none';
                document.getElementById('back-button').style.display = 'block';

            });
            document.querySelector("#ins4").addEventListener("click", () => {
                oxExp.switchModel(3);
                playAudio("assets/sounds/wrong.mp3");

                document.getElementById('insidebuttons-controls').style.display = 'none';
                document.getElementById('insidebuttons-controls1').style.display = 'flex';
                document.getElementById('back-button').style.display = 'block';
                document.getElementById('errorimg').style.display = 'block';
                document.getElementById('ins7').style.display = 'block';
                document.getElementById('ins4').style.display = 'none';

            });
            document.querySelector("#ins7").addEventListener("click", () => {
                oxExp.switchModel(3);
                playAudio("assets/sounds/write.mp3");
                document.getElementById('errorimg').style.display = 'none';
                document.getElementById('ins7').style.display = 'none';
                document.getElementById('ins4').style.display = 'block';

            });
            document.querySelector("#ins5").addEventListener("click", () => {
                oxExp.switchModel(4);
                playAudio("assets/sounds/USP_2.mp3");
                document.getElementById('errorimg').style.display = 'none';
                document.getElementById('insidebuttons-controls').style.display = 'none';
                document.getElementById('insidebuttons-controls1').style.display = 'flex';
                document.getElementById('back-button').style.display = 'block';
                document.getElementById('ins7').style.display = 'none';
                document.getElementById('ins4').style.display = 'block';

            });
            document.querySelector("#ins6").addEventListener("click", () => {
                oxExp.switchModel(5);
                playAudio("assets/sounds/USP_3.mp3");
                document.getElementById('errorimg').style.display = 'none';
                document.getElementById('insidebuttons-controls').style.display = 'none';
                document.getElementById('insidebuttons-controls1').style.display = 'flex';
                document.getElementById('back-button').style.display = 'block';
                document.getElementById('ins7').style.display = 'none';
                document.getElementById('ins4').style.display = 'block';

            });

        } catch (err) {
            console.error("Error initializing UI", err);
        }
    }

    hideLoading() {
        this._loadingScreen.style.display = "none";
        this._transformControls.style.display = "flex";
    }

    showError(title, message) {
        this._errorTitle.textContent = title;
        this._errorMessage.textContent = message;
        this._errorScreen.style.display = "flex";
    }

    onPlace(listener) {
        this._placeButton.addEventListener('click', listener);
    }
}