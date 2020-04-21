// *********** E-Signature *************

eSignature = () => {
  const canvasWrapper = document.querySelector(".canvas-wrapper");
  const canvas = document.querySelector(".sig-canvas");
  const emptyCanvas = document.querySelector(".empty-canvas");
  let canvasWrapperWidth = canvasWrapper.offsetWidth;
  emptyCanvas.width = canvasWrapperWidth;
  canvas.width = canvasWrapperWidth;

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
    // console.log("prevPosition: ", prevPosition);
  });

  canvas.addEventListener("mousemove", (event) => {
    position = getMousePos(canvas, event);
  });

  canvas.addEventListener("mouseup", (event) => {
    sign = false;
  });

  getMousePos = (canvasDom, mouseEvent) => {
    let rect = canvasDom.getBoundingClientRect();
    // console.log("RECT: ", rect);

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

// *********** SignUp UserInput *************

signUpUserInput = () => {
  const signUpForm = document.querySelector(".signUp-input-fields");
  const signUpUserInput = document.querySelectorAll(".signUp-UserInput");

  signUpForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstName = signUpUserInput[0].value;
    const lastName = signUpUserInput[1].value;
    const email = signUpUserInput[2].value;
    const password = signUpUserInput[3].value;
    const emailExsists = document.querySelector(".emailExsists");
    const orLine = document.querySelector(".or");
    const alreadyAMember = document.querySelector(".alreadyAMember");
    if (
      firstName !== "" &&
      lastName !== "" &&
      email !== "" &&
      password !== ""
    ) {
      console.log(firstName, lastName, email, password);
      $.ajax({
        url: "/signup-api",
        method: "POST",
        data: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password,
        },

        success: (response) => {
          console.log("RESPONSE", response);
          window.location.href = "/login";
        },

        error: (err) => {
          alreadyAMember.classList.add("off");
          emailExsists.classList.add("on");
          orLine.classList.add("off");
          console.log(err);
        },
      });
    }
  });
};

// ********************************** LogIn UserInput **********************************

logInUserInput = () => {
  const logInForm = document.querySelector(".logIn-input-fields");
  const logInUserInput = document.querySelectorAll(".logIn-UserInput");

  logInForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = logInUserInput[0].value;
    const password = logInUserInput[1].value;
    console.log("EMAIL :", email);
    console.log("PASSWORD: ", password);
    const wrongPass = document.querySelector(".incorrectPass");

    if (email !== "" && password !== "") {
      $.ajax({
        url: "/login-api",
        method: "POST",
        data: {
          email: email,
          password: password,
        },
        success: (response) => {
          window.location.href = "/petition";
        },
        error: (err) => {
          wrongPass.textContent = err.responseJSON.message;
          wrongPass.classList.add("on");
          console.log(err);
        },
      });
    }
  });
};

// ********************************** Edit User Profile **********************************
editUserProfile = () => {
  const editProfile = document.querySelector(".editProfileBtn");
  const editProfileForm = document.querySelector(".userProfile-InputFields");
  const nameElement = document.querySelector('input[name="firstName"]');

  console.log("editProfile: ", editProfile);

  editProfile.addEventListener("click", (event) => {
    const profileInput = document.querySelectorAll(".profileUserInput");

    profileInput.forEach((element) => {
      element.disabled = false;
    });

    nameElement.focus();
  });

  editProfileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log(event);
    // const elementsList = event.srcElement.elements;

    const dataToSend = {
      firstName: document.querySelector('input[name="firstName"]').value,
      lastName: document.querySelector('input[name="lastName"]').value,
      password: document.querySelector('input[name="password"]').value,
      city: document.querySelector('input[name="city"]').value,
      country: document.querySelector('input[name="country"]').value,
      age: document.querySelector('input[name="age"]').value,
    };

    console.log(dataToSend);
    const successMsg = document.querySelector(".profileUpdated");
    const failureMsg = document.querySelector(".profileFailed");

    $.ajax({
      url: "/userprofile",
      method: "POST",
      data: dataToSend,
      success: (response) => {
        console.log(response);
        successMsg.textContent = response.message;
        successMsg.classList.add("on");
      },
      error: (err) => {
        failureMsg.textContent = response.responseJSON.message;
        failureMsg.classList.add("on");
      },
    });
  });
};

// ********************************** Petition Signature **********************************

userSignature = () => {
  const submitSig = document.querySelector(".submit-button");
  const sigCanvas = document.querySelector(".sig-canvas");
  const emptyCanvas = document.querySelector(".empty-canvas");
  const errorMsg = document.querySelector(".errorMsg");

  submitSig.addEventListener("click", (event) => {
    event.preventDefault();

    const signatureUrl = sigCanvas.toDataURL();
    const emptyCanvasUrl = emptyCanvas.toDataURL();

    if (signatureUrl == emptyCanvasUrl) {
      errorMsg.classList.add("on");
    } else {
      $.ajax({
        url: "/petition-api",
        method: "POST",
        data: {
          signatureUrl: signatureUrl,
        },
        success: (response) => {
          window.location.href = "/thanks";
        },
      });
    }
  });
};

// ********************************** Un-Sign **********************************

removeSig = () => {
  const yesBtn = document.querySelector(".yes");

  yesBtn.addEventListener("click", (event) => {
    $.ajax({
      url: "/unsign",
      method: "POST",
      data: {
        signatureUrl: null,
      },
      success: (response) => {
        console.log("REMOVE SIG RESPONSE", response);
        window.location.href = "/petition";
      },
      error: (error) => {
        console.log("REMOVE SIG ERROR", error);
      },
    });
  });
};
