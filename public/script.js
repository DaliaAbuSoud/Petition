// *********** E-Signature *************

eSignature = () => {
    const canvas = document.querySelector(".sig-canvas");
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    let sign = false;
    let position = {
        x: 0,
        y: 0,
    };
    let prevPosition = position;

    //Mouse signature
    canvas.addEventListener("mousedown", (event) => {
        sign = true;
        prevPosition = getMousePos(canvas, event);
    });

    canvas.addEventListener("mousemove", (event) => {
        position = getMousePos(canvas, event);
    });

    canvas.addEventListener("mouseup", (event) => {
        sign = false;
    });

    getMousePos = (canvasDom, mouseEvent) => {
        let rect = canvasDom.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - rect.left,
            y: mouseEvent.clientY - rect.top,
        };
    };

    // Touch Signature
    canvas.addEventListener("touchstart", (event) => {}, false);

    canvas.addEventListener("touchstart", (event) => {
        position = getTouchPos(canvas, event);
        let touch = event.touches[0];
        let touchSign = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        canvas.dispatchEvent(touchSign);
    });

    canvas.addEventListener("touchmove", (event) => {
        let touch = event.touches[0];
        let touchSign = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        canvas.dispatchEvent(touchSign);
    });

    canvas.addEventListener("touchend", (e) => {
        var touchSign = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(touchSign);
    });

    getTouchPos = (canvasDom, event) => {
        let rect = canvasDom.getBoundingClientRect();
        console.log("RECT: ", rect);
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top,
        };
    };

    // Prevent default scrolling
    document.body.addEventListener("touchstart", (event) => {
        if (event.target == canvas) {
            event.preventDefault();
        }
    });

    document.body.addEventListener("touchend", (event) => {
        if (event.target == canvas) {
            event.preventDefault();
        }
    });

    document.body.addEventListener("touchmove", (e) => {
        if (event.target == canvas) {
            event.preventDefault();
        }
    });

    renderCanvas = () => {
        if (sign) {
            ctx.moveTo(prevPosition.x, prevPosition.y);
            ctx.lineTo(position.x, position.y);
            ctx.stroke();
            prevPosition = position;
        }
    };

    (draw = () => {
        window.requestAnimationFrame(draw);
        renderCanvas();
    })();

    // Signature URL
    const sigImage = document.querySelector(".signatureUrl");
    const clearSig = document.querySelector(".clear-sig");
    const submitSig = document.querySelector(".submit-button");

    clearSig.addEventListener("click", (event) => {
        canvas.width = canvas.width;
    });
};

// *********** User Input Data *************

userInputData = () => {
    const sigCanvas = document.querySelector(".sig-canvas");
    const submitForm = document.querySelector(".input-fields");
    const userInput = document.querySelectorAll(".userInput");
    const emptyCanvas = document.querySelector(".empty-canvas");
    const errorMsg = document.querySelector(".errorMsg");

    submitForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const firstName = userInput[0].value;
        const lastName = userInput[1].value;
        const city = userInput[2].value;
        const country = userInput[3].value;
        let signatureUrl = sigCanvas.toDataURL();
        let emptyCanvasUrl = emptyCanvas.toDataURL();

        console.log("firstName:", firstName);
        console.log("lastName:", lastName);
        console.log("city:", city);
        console.log("country:", country);

        if (signatureUrl == emptyCanvasUrl) {
            errorMsg.classList.add("on");
        } else {
            console.log("signatureUrl:", signatureUrl);
            $.ajax({
                url: "/petition",
                method: "POST",
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    city: city,
                    country: country,
                    signatureUrl: signatureUrl,
                },

                success: (response) => {
                    window.location.href = "/thanks";
                },
            });
        }
    });
};
